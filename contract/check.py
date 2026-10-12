from contract.types import RANGES, BalanceCorrection


class ContractError(ValueError):
    def __init__(self, field: str) -> None:
        self.field = field
        super().__init__(f"{field} is outside its range")


def check_ranges(output: BalanceCorrection) -> None:
    """Raise ContractError naming the field when a value is outside its range."""
    for field, (low, high) in RANGES.items():
        value = getattr(output, field)
        if value < low or value > high:
            raise ContractError(field)
