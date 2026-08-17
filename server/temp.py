from utils.client import client
info = client.get_collection("selected_scripts_corpus")
print(info.payload_schema)

records, _ = client.scroll(
    collection_name="selected_scripts_corpus",
    limit=20,
    with_payload=True,
)
for r in records:
    print(r.payload.get("creator_id"), "|", r.payload.get("niche"))