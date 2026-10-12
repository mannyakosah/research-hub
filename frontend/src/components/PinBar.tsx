import { Term } from "./Term";

type Props = {
  dev: string;
  prod: string;
};

export function PinBar({ dev, prod }: Props) {
  return (
    <div className="pin-bar">
      <span className="pin">
        <Term id="dev">Dev</Term>
        <code>{dev}</code>
      </span>
      <span className="pin">
        <Term id="prod">Prod</Term>
        <code>{prod}</code>
      </span>
    </div>
  );
}
