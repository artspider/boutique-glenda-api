"""add notes to inventory movements

Revision ID: b8f2c9e41c12
Revises: 46f4dd805c4e
Create Date: 2026-04-18 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8f2c9e41c12'
down_revision: Union[str, Sequence[str], None] = '46f4dd805c4e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('inventory_movements', sa.Column('notes', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('inventory_movements', 'notes')
