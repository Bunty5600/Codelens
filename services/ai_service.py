import httpx
import os


async def get_refactor_recommendations(
        cc: float,
        mi: float,
        loc: int,
        functions: int,
        halstead: dict,
        smells: list
) -> dict:
    groq_key = os.getenv("GROQ_API_KEY")

    smell_text = "\n".join(
        [f"- {s['type']} ({s['severity']}): {s['message']}" for s in smells]
    ) if smells else "None detected"

    prompt = f"""You are a Senior Software Architect reviewing Python code metrics.

METRICS:
- Cyclomatic Complexity: {cc}
- Maintainability Index: {mi}/100
- Lines of Code: {loc}
- Functions: {functions}
- Halstead Volume: {halstead.get('volume', 0):.0f}
- Halstead Effort: {halstead.get('effort', 0):.0f}

CODE SMELLS:
{smell_text}

Respond in EXACTLY this format, no markdown, no extra text:

RISK_LEVEL: [Low/Medium/High]

ROOT_CAUSE:
[2-3 sentences explaining the main quality issue]

REFACTORING:
- [specific action 1]
- [specific action 2]
- [specific action 3]

ARCHITECTURE:
- [architectural improvement 1]
- [architectural improvement 2]"""

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 400
            },
            timeout=30.0
        )

    raw = response.json()
    content = raw.get("choices", [{}])[0].get("message", {}).get("content", "")
    return parse_ai_response(content)


def parse_ai_response(content: str) -> dict:
    result = {
        "risk_level": "Medium",
        "root_cause": "",
        "refactoring": [],
        "architecture": []
    }

    try:
        lines = content.strip().split("\n")
        current_section = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if line.startswith("RISK_LEVEL:"):
                result["risk_level"] = line.replace("RISK_LEVEL:", "").strip()

            elif line.startswith("ROOT_CAUSE:"):
                current_section = "root_cause"

            elif line.startswith("REFACTORING:"):
                current_section = "refactoring"

            elif line.startswith("ARCHITECTURE:"):
                current_section = "architecture"

            elif current_section == "root_cause":
                result["root_cause"] += line + " "

            elif current_section == "refactoring" and line.startswith("-"):
                result["refactoring"].append(line[1:].strip())

            elif current_section == "architecture" and line.startswith("-"):
                result["architecture"].append(line[1:].strip())

        result["root_cause"] = result["root_cause"].strip()

    except Exception as e:
        print("AI parse error:", e)

    return result