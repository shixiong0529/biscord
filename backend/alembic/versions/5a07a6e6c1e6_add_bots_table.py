"""add bots table

Revision ID: 5a07a6e6c1e6
Revises: f6a7b8c9d0e1
Create Date: 2026-05-06 11:08:55.616381
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '5a07a6e6c1e6'
down_revision: Union[str, None] = 'f6a7b8c9d0e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('bots',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=64), nullable=False),
    sa.Column('username', sa.String(length=32), nullable=False),
    sa.Column('password', sa.String(length=128), nullable=False),
    sa.Column('display_name', sa.String(length=32), nullable=False),
    sa.Column('avatar_color', sa.String(length=16), server_default='av-3', nullable=False),
    sa.Column('llm_api_key', sa.String(length=256), nullable=False),
    sa.Column('llm_base_url', sa.String(length=256), server_default='https://api.deepseek.com', nullable=False),
    sa.Column('llm_model', sa.String(length=64), server_default='deepseek-chat', nullable=False),
    sa.Column('system_prompt', sa.Text(), server_default='你是摸鱼社区的 AI 助手，风格轻松友好，回答简洁，适当使用中文网络用语。', nullable=False),
    sa.Column('channel_ids', sa.Text(), server_default='[]', nullable=False),
    sa.Column('is_active', sa.Boolean(), server_default='0', nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('username')
    )
    op.create_index(op.f('ix_bots_id'), 'bots', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_bots_id'), table_name='bots')
    op.drop_table('bots')
