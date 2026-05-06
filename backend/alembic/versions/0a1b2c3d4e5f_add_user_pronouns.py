"""add user pronouns

Revision ID: 0a1b2c3d4e5f
Revises: 718a9e58829e
Create Date: 2026-05-06 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0a1b2c3d4e5f'
down_revision: Union[str, None] = '718a9e58829e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('pronouns', sa.String(length=16), nullable=False, server_default='private'))


def downgrade() -> None:
    op.drop_column('users', 'pronouns')
