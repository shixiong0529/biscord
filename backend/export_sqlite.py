"""
导出 SQLite 数据为 PostgreSQL 兼容的 SQL 文件
用法：cd backend && python export_sqlite.py > export.sql
"""
import sqlite3
import json
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / "biscord.db"

# 按 FK 依赖顺序排列的表
TABLES = [
    "users",
    "servers",
    "server_members",
    "channel_groups",
    "channels",
    "messages",
    "reactions",
    "pinned_messages",
    "direct_messages",
    "invites",
    "join_requests",
    "friend_requests",
    "friendships",
    "reports",
    "audit_logs",
]

BOOL_COLUMNS = {
    "users": {"telegram_notify_enabled", "is_admin", "is_banned"},
    "servers": {"is_recommended", "auto_join"},
    "messages": {"is_edited", "is_deleted"},
    "direct_messages": {"is_read", "is_deleted"},
    "server_members": {},
}

JSON_COLUMNS = {
    "audit_logs": {"detail"},
    "reports": {},
}


def escape(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, int):
        return str(val)
    if isinstance(val, float):
        return str(val)
    if isinstance(val, dict):
        s = json.dumps(val, ensure_ascii=False)
        return "'" + s.replace("'", "''") + "'"
    s = str(val)
    return "'" + s.replace("'", "''") + "'"


def convert_value(table, col, val):
    if val is None:
        return None
    # SQLite booleans are stored as 0/1
    bool_cols = BOOL_COLUMNS.get(table, set())
    if col in bool_cols:
        return bool(val)
    # JSON columns stored as text in SQLite
    json_cols = JSON_COLUMNS.get(table, set())
    if col in json_cols and isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return val
    return val


def main():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    print("-- SQLite → PostgreSQL export")
    print(f"-- Generated: {datetime.now().isoformat()}")
    print()
    print("BEGIN;")
    print()

    # Disable FK checks during import, truncate in reverse order
    print("-- Truncate tables in reverse FK order")
    for table in reversed(TABLES):
        print(f"TRUNCATE TABLE {table} CASCADE;")
    print()

    for table in TABLES:
        cur.execute(f"SELECT * FROM {table}")
        rows = cur.fetchall()
        if not rows:
            print(f"-- (no data in {table})")
            continue

        cols = [d[0] for d in cur.description]
        print(f"-- {table}: {len(rows)} rows")

        for row in rows:
            values = []
            for col, val in zip(cols, row):
                converted = convert_value(table, col, val)
                values.append(escape(converted))

            col_list = ", ".join(cols)
            val_list = ", ".join(values)
            print(f"INSERT INTO {table} ({col_list}) VALUES ({val_list});")

        print()

    # Reset sequences
    print("-- Reset sequences")
    seq_tables = ["users", "servers", "server_members", "channel_groups",
                  "channels", "messages", "reactions", "pinned_messages",
                  "direct_messages", "invites", "join_requests",
                  "friend_requests", "friendships", "reports", "audit_logs"]
    for table in seq_tables:
        print(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE(MAX(id), 1)) FROM {table};")

    print()
    print("COMMIT;")
    conn.close()


if __name__ == "__main__":
    import sys
    import io
    # 直接写文件，强制 UTF-8，避免 Windows 重定向编码问题
    out_path = Path(__file__).parent / "export.sql"
    with io.open(str(out_path), "w", encoding="utf-8", newline="\n") as f:
        old_stdout = sys.stdout
        sys.stdout = f
        main()
        sys.stdout = old_stdout
    print(f"导出完成：{out_path}")
    print(f"文件大小：{out_path.stat().st_size} bytes")
