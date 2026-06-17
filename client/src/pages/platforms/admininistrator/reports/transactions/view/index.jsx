import { Dialog, DialogContent } from "@/components/ui/dialog";
import "./style.css";
import { format } from "@/services/utilities";
const ViewTransaction = ({ isOpen, setIsOpen, selected = {} }) => {
  const {
    cashier,
    cart = [],
    amount: totalAmount,
    cash = 0,
    createdAt,
  } = selected;
  const { fullName = {} } = cashier || {};
  const change = cash - totalAmount;
  const vatRate = 0.12;
  const vatableSales = totalAmount / (1 + vatRate);
  const vat = totalAmount - vatableSales;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[28rem] container-receipt-viewing ">
        <div>
          <h2 className="text-3xl font-bold text-center">Petromic</h2>
          <h2 className="text-[17px] -mt-1 text-center">Gas Station</h2>
        </div>
        <div className="-mt-5">
          <h2 className="text-[16px] text-center">
            Brgy Rio Chico Gen. Tinio, Nueva Ecija
          </h2>
          <h1 className="font-bold text-[15px] text-center block">
            {new Date(createdAt).toDateString()},{" "}
            {new Date(createdAt).toLocaleTimeString()}
          </h1>
        </div>
        <div
          className="text-center -mt-1 "
          style={{
            border: "1px dashed #000",
            borderRadius: "5px",
            padding: "2px",
            position: "relative",
          }}
        >
          <small
            style={{
              position: "absolute",
              fontWeight: 600,
              top: "-15px",
              fontSize: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "white",
              padding: "0 3px",
            }}
          >
            Transaction ID
          </small>
          <span className="block text-[17px] mt-1">{selected?._id}</span>
        </div>

        <div className="receipt-table -mt-3">
          <div className="receipt-table-header-container-viewing">
            <div className="receipt-table-header-viewing">
              <span>Fuel</span>
              <span>Liters</span>
              <span>Amount</span>
            </div>
          </div>

          {cart.map((item, i) => {
            const { fuel, amount } = item;
            const { pricing } = fuel;
            const { cost, markup } = pricing;
            const srp = cost + markup;
            return (
              <div key={i} className="receipt-row">
                <span className="item-name text-[1rem]">{fuel.name}</span>
                <span className="text-[1rem]">
                  {format.liters(amount, srp)}
                </span>
                <span className="text-[1rem]">{format.peso(amount)}</span>
              </div>
            );
          })}

          <div className="totals text-[1rem]">
            <span>VATable Sales:</span>
            <span>{format.peso(vatableSales)}</span>
          </div>
          <div className="totals text-[1rem]">
            <span>VAT (12%):</span>
            <span>{format.peso(vat)}</span>
          </div>

          <div className="totals">
            <span className="text-[1rem]">Total Amount:</span>
            <span className="font-weight-bold text-[1rem]">
              {format.peso(totalAmount)}
            </span>
          </div>

          <div className="footer-receipt-viewing">
            <div className="flex justify-between">
              <span className="block">Tendered:</span>
              <span className="block">{format.peso(cash)}</span>
            </div>
            <div className="flex justify-between -mt-1">
              <span>Change:</span>
              <span>{format.peso(change)}</span>
            </div>
          </div>
          <div className="flex justify-between cashier-viewing-transaction">
            <span>Cashier:</span>
            <span>{`${fullName.fname} ${fullName.lname}`}</span>
          </div>

          <div className="text-center mt-3 text-[1rem]">
            <small className="block">THIS SERVES AS YOUR SALES INVOICE</small>
            <small>THANK YOU. DRIVE SAFELY!</small>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTransaction;
