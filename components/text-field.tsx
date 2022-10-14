import { forwardRef } from "react";
import { UseFormRegister } from "react-hook-form";
import { ProductDTO } from "types/dto";

interface TextFieldProps {
  label: string;
  inputType?: "text" | "number";
  defaultValue?: string | number;
}

type RefProps = TextFieldProps & ReturnType<UseFormRegister<ProductDTO>>;

const TextField = forwardRef<HTMLInputElement, RefProps>(
  ({ defaultValue, onChange, inputType, label, name }, ref) => {
    return (
      <div className="space-y-1">
        <h3>{label}</h3>
        <input
          defaultValue={defaultValue}
          ref={ref}
          name={name}
          onChange={onChange}
        />
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;
