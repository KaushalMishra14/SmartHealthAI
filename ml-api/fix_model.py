import h5py
import json
import shutil

old_model = "model/disease_predictor.h5"
fixed_model = "model/disease_predictor_fixed.h5"

shutil.copy(old_model, fixed_model)

def fix_dtype_policy(obj):
    if isinstance(obj, dict):
        if obj.get("class_name") == "DTypePolicy":
            return obj.get("config", {}).get("name", "float32")

        for key in list(obj.keys()):
            obj[key] = fix_dtype_policy(obj[key])

    elif isinstance(obj, list):
        for i in range(len(obj)):
            obj[i] = fix_dtype_policy(obj[i])

    return obj

with h5py.File(fixed_model, "r+") as f:
    model_config = f.attrs.get("model_config")

    if isinstance(model_config, bytes):
        model_config = model_config.decode("utf-8")

    config = json.loads(model_config)

    for layer in config["config"]["layers"]:
        if layer["class_name"] == "InputLayer":
            layer_config = layer["config"]

            if "batch_shape" in layer_config:
                layer_config["batch_input_shape"] = layer_config.pop("batch_shape")

    config = fix_dtype_policy(config)

    f.attrs["model_config"] = json.dumps(config).encode("utf-8")

print("✅ Model fixed successfully")
print("Saved as model/disease_predictor_fixed.h5")