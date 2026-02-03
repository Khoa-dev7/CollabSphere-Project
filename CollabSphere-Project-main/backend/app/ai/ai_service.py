from app.ai.ai_client import client
from app.ai.prompts import TASK_ASSIGN_PROMPT

def suggest_task_assignment(project_desc, members, tasks):
    prompt = TASK_ASSIGN_PROMPT.format(
        project_desc=project_desc,
        members=", ".join(members),
        tasks=", ".join(tasks)
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful academic assistant"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    return response.choices[0].message.content
