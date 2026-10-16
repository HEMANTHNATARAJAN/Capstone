import json
import yaml
from backend.app.main import app

def export_specs():
    openapi_schema = app.openapi()
    
    with open("openapi.json", "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2)
    print("Exported openapi.json successfully")

    with open("openapi.yaml", "w", encoding="utf-8") as f:
        yaml.dump(openapi_schema, f, sort_keys=False)
    print("Exported openapi.yaml successfully")

if __name__ == "__main__":
    export_specs()
