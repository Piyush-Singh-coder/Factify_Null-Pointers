import { Loader2 } from "lucide-react";

const Spinner = ({ size = 24 }) => (
  <Loader2 className="animate-spin text-primary" size={size} />
);

export default Spinner;
