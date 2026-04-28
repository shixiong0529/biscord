"""server auto_join and position ordering

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-04-28 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f6a7b8c9d0e1'
down_revision: Union[str, None] = 'e5f6a7b8c9d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('servers', sa.Column('auto_join', sa.Boolean(), nullable=False, server_default='0'))
    op.add_column('servers', sa.Column('join_order', sa.Integer(), nullable=False, server_default='999'))
    op.add_column('server_members', sa.Column('position', sa.Integer(), nullable=False, server_default='999'))


def downgrade() -> None:
    op.drop_column('server_members', 'position')
    op.drop_column('servers', 'join_order')
    op.drop_column('servers', 'auto_join')
