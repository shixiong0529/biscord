"""add is_bot to users

Revision ID: 718a9e58829e
Revises: 5a07a6e6c1e6
Create Date: 2026-05-06 16:01:08.712072
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '718a9e58829e'
down_revision: Union[str, None] = '5a07a6e6c1e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_bot', sa.Boolean(), server_default='0', nullable=False))
    op.execute("UPDATE users SET is_bot = TRUE WHERE id IN (SELECT user_id FROM bots WHERE user_id IS NOT NULL)")


def downgrade() -> None:
    op.drop_column('users', 'is_bot')
