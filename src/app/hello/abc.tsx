import { FC } from "react";

type Props = { 
  onChange: (val: string) => void
};

const Abc: FC<Props> = (props) => {  

  function handleChange(e: any): void {
    const { name, value } = e.target;
    props.onChange(value);
  }

  return (
    <div>
      <select id="abcSelect" onChange={handleChange}>
        <option value="AAA">AAA</option>
        <option value="BBB">BBB</option>
        <option value="CCC">CCC</option>
      </select>
    </div>
  )
}

export default Abc;