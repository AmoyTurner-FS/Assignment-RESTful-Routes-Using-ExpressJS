const express = require("express");
const router = express.Router();

let lib = null;
try {
  lib = require("@jworkman-fs/asl");
} catch {}

function loadContacts() {
  try {
    if (lib?.ContactModel && Array.isArray(lib.ContactModel))
      return lib.ContactModel;
    if (Array.isArray(lib?.contacts)) return lib.contacts;
    if (lib?.ContactModel?.getAll) return lib.ContactModel.getAll();
  } catch {}
  return require("./seed/contacts.json");
}

function normalize(c) {
  return {
    id: String(c.id ?? ""),
    firstName: c.firstName ?? "",
    lastName: c.lastName ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    birthday: c.birthday ?? "",
  };
}

function computeNextId(arr) {
  return arr.reduce((m, c) => Math.max(m, Number(c.id) || 0), 0) + 1;
}

function getHeader(req, key) {
  return (
    req.headers[key.toLowerCase()] ?? req.headers[`x-${key.toLowerCase()}`]
  );
}

function getFilters(req) {
  const q = req.query || {};
  const f = {};
  const fields = ["firstName", "lastName", "email", "phone", "birthday"];
  for (const name of fields) {
    const qv =
      q[name] ??
      q[name.toLowerCase()] ??
      q[name.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())];
    const hv = getHeader(req, name);
    if (qv) f[name] = String(qv);
    else if (hv) f[name] = String(hv);
  }
  return f;
}

function applyFilter(list, filters) {
  if (lib?.filterContacts) return lib.filterContacts(list, filters);
  return list.filter((c) =>
    Object.entries(filters).every(([k, v]) => {
      const cv = (c[k] ?? "").toString();
      if (!cv) return false;
      if (k === "birthday") return cv === v;
      return cv.toLowerCase().includes(String(v).toLowerCase());
    })
  );
}

function getSort(req) {
  const by = req.query.sortBy || req.query.sort_by || getHeader(req, "Sort-By");
  const dir = (
    req.query.order ||
    req.query.sort_dir ||
    getHeader(req, "Sort-Dir") ||
    "asc"
  ).toLowerCase();
  return { by, dir };
}

function applySort(list, { by, dir }) {
  if (!by) return list;
  if (lib?.sortContacts) return lib.sortContacts(list, by, dir);
  const out = [...list];
  out.sort((a, b) => {
    const av = (a[by] ?? "").toString().toLowerCase();
    const bv = (b[by] ?? "").toString().toLowerCase();
    if (av < bv) return dir === "desc" ? 1 : -1;
    if (av > bv) return dir === "desc" ? -1 : 1;
    return 0;
  });
  return out;
}

function getPagination(req) {
  const page = Number(req.query.page || getHeader(req, "Page") || 1);
  const perPage = Number(
    req.query.perPage || req.query.per_page || getHeader(req, "Per-Page") || 10
  );
  return { page: page > 0 ? page : 1, perPage: perPage > 0 ? perPage : 10 };
}

function applyPagination(list, { page, perPage }) {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const items = list.slice(start, start + perPage);
  return { items, total, totalPages };
}

function setPagingHeaders(res, { page, perPage }, total, totalPages) {
  res.set("X-Total-Count", String(total));
  res.set("X-Total-Pages", String(totalPages));
  res.set("X-Page", String(page));
  res.set("X-Per-Page", String(perPage));
}

let baseContacts = loadContacts().map(normalize);
let contacts = [...baseContacts];
let nextId = computeNextId(contacts);

router.get("/", (req, res) => {
  const filters = getFilters(req);
  let result = applyFilter(contacts, filters);
  result = applySort(result, getSort(req));
  const { page, perPage } = getPagination(req);
  const { items, total, totalPages } = applyPagination(result, {
    page,
    perPage,
  });
  setPagingHeaders(res, { page, perPage }, total, totalPages);
  res.status(200).json(items);
});

router.get("/:id", (req, res) => {
  const contact = contacts.find((c) => c.id === String(req.params.id));
  if (!contact) return res.status(404).json({ error: "Not Found" });
  res.json(contact);
});

router.post("/", (req, res) => {
  const { firstName, lastName, email, phone, birthday } = req.body || {};
  if (!firstName || !lastName || !email) {
    return res
      .status(400)
      .json({ error: "firstName, lastName, and email are required" });
  }
  const created = normalize({
    id: nextId++,
    firstName,
    lastName,
    email,
    phone: phone ?? "",
    birthday: birthday ?? "",
  });
  contacts.push(created);
  res.status(201).json(created);
});

router.put("/:id", (req, res) => {
  const idx = contacts.findIndex((c) => c.id === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not Found" });
  const { firstName, lastName, email, phone, birthday } = req.body || {};
  if (!firstName || !lastName || !email) {
    return res
      .status(400)
      .json({ error: "firstName, lastName, and email are required" });
  }
  const updated = normalize({
    id: contacts[idx].id,
    firstName,
    lastName,
    email,
    phone: phone ?? "",
    birthday: birthday ?? "",
  });
  contacts[idx] = updated;
  res.json(updated);
});

router.patch("/:id", (req, res) => {
  const idx = contacts.findIndex((c) => c.id === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not Found" });
  const current = contacts[idx];
  const merged = normalize({ ...current, ...req.body, id: current.id });
  contacts[idx] = merged;
  res.json(merged);
});

router.delete("/:id", (req, res) => {
  const idx = contacts.findIndex((c) => c.id === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not Found" });
  contacts.splice(idx, 1);
  res.status(204).send();
});

router.post("/reset/all", (_req, res) => {
  contacts = [...baseContacts];
  nextId = computeNextId(contacts);
  res.status(204).send();
});

module.exports = router;
