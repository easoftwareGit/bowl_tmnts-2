import { Pot } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library";

export const mockPots = [
  {
    id: 'pot_f7935dec9e8b46148d6f1a6637daebf5',
    div_id: "div_578834e04e5e4885bbae79229d8b96e8",
    squad_id: '1',
    pot_type: 'Game',
    pot_type_err: '',
    div_name: 'Scratch',
    div_err: '',
    fee: '20',
    fee_err: '',
    sort_order: 1,
    errClassName: ''
  },
  {
    id: 'pot_4fe4f6d6c5694db189543bb68c0a9ec1',
    div_id: "div_578834e04e5e4885bbae79229d8b96e8",
    squad_id: '1',
    pot_type: 'Last Game',
    pot_type_err: '',
    div_name: 'Scratch',
    div_err: '',
    fee: '10',
    fee_err: '',
    sort_order: 2,
    errClassName: ''
  },
  {
    id: 'pot_8fe7ef034c8e4516993a49d7ab7df269',
    div_id: "div_24b1cd5dee0542038a1244fc2978e862",
    squad_id: '1',
    pot_type: 'Game',
    pot_type_err: '',
    div_name: 'Hdcp',
    div_err: '',
    fee: '20',
    fee_err: '',
    sort_order: 3,
    errClassName: ''
  },
  {
    id: 'pot_8fe7ef034c8e4516993a49d7ab7df269',
    div_id: "div_24b1cd5dee0542038a1244fc2978e862",
    squad_id: '1',
    pot_type: 'Last Game',
    pot_type_err: '',
    div_name: 'Hdcp',
    div_err: '',
    fee: '10',
    fee_err: '',
    sort_order: 4,
    errClassName: ''
  }
]
