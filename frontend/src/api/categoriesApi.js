import httpClient from "./httpClient";

export async function fetchCategories() {
  const res = await httpClient.get("/categories/");
  // Expecting list of {id, name}
  const categories = res.data;
  // Map id → name
  const map = {};
  for (const cat of categories) {
    map[cat.id] = cat.name;
  }
  return map;
}
