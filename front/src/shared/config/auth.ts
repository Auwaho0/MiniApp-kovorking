// Список тех, кому разрешён вход.
// Совпадение по ЛЮБОМУ полю (id ИЛИ username) — доступ разрешён.
// Username сравнивается без учёта регистра (и без @).
export const ALLOWED_USERS: Array<{ id?: number; username?: string }> = [
  { id: 123456789, username: "Artem_Masloy" },
  { username: "Masloy_Artem" }
];

// Админы (могут удалять чужие записи и жать «Оповестить»).
// Должно совпадать с ADMIN_IDS на бэкенде.
export const ADMIN_IDS = new Set<number>([
  // 123456789,
  // 987654321,
]);