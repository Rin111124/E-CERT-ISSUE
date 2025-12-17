// Canonical JSON stringifier with sorted keys
export function canonicalize(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map((v) => canonicalize(v)).join(",") + "]";
  }
  const keys = Object.keys(value).sort();
  return (
    "{" +
    keys
      .map((k) => {
        return JSON.stringify(k) + ":" + canonicalize(value[k]);
      })
      .join(",") +
    "}"
  );
}
