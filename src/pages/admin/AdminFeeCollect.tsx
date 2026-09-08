import React, { useState, useEffect, useRef } from "react";
import { Search, User, Receipt, CreditCard, ChevronRight, CheckCircle2, IndianRupee, FileText, Printer, Download } from "lucide-react";
import { collection, query, where, getDocs, doc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Student, StudentFee, FeeTransaction } from "../../types";
import toast from "react-hot-toast";

export default function AdminFeeCollect() {
  const { userData } = useAuth();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [pendingFees, setPendingFees] = useState<StudentFee[]>([]);
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);
  
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    discount: 0,
    lateFee: 0,
    paymentMethod: "CASH" as FeeTransaction['paymentMethod'],
    referenceNumber: "",
    notes: "",
  });

  const [receipt, setReceipt] = useState<FeeTransaction | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Implement debounced student search here. Initial fetch.
    const fetchStudents = async () => {
      if (!userData?.schoolId) return;
      try {
        const q = query(collection(db, "students"), where("schoolId", "==", userData.schoolId));
        const snapshot = await getDocs(q);
        setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
      } catch (error) {
        console.error("Error fetching students", error);
      }
    };
    fetchStudents();
  }, [userData]);

  const selectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setStep(2);
    
    // Fetch pending fees for this student
    if (!userData?.schoolId || !student.id) return;
    try {
      const q = query(
        collection(db, "fees"), 
        where("schoolId", "==", userData.schoolId),
        where("studentId", "==", student.id),
        where("status", "in", ["PENDING", "PARTIAL", "OVERDUE"])
      );
      const snapshot = await getDocs(q);
      setPendingFees(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as StudentFee)));
    } catch (error) {
      console.error("Error fetching fees", error);
    }
  };

  const proceedToPayment = (fee: StudentFee) => {
    setSelectedFee(fee);
    setPaymentData({
      ...paymentData,
      amount: fee.pendingAmount,
    });
    setStep(3);
  };

  const handlePayment = async () => {
    if (!userData?.schoolId || !selectedStudent?.id || !selectedFee?.id) return;
    
    if (paymentData.amount <= 0 || paymentData.amount > selectedFee.pendingAmount + paymentData.lateFee) {
      toast.error("Invalid payment amount");
      return;
    }

    try {
      const transactionId = "REC-" + Date.now().toString().slice(-6);
      
      const newTransaction: Partial<FeeTransaction> = {
        schoolId: userData.schoolId,
        receiptNumber: transactionId,
        studentId: selectedStudent.id,
        studentFeeId: selectedFee.id,
        amount: paymentData.amount,
        discount: paymentData.discount,
        lateFee: paymentData.lateFee,
        totalPayable: paymentData.amount + paymentData.lateFee - paymentData.discount,
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber,
        paymentDate: new Date().toISOString(),
        status: "SUCCESS",
        notes: paymentData.notes,
        collectedBy: userData.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const txRef = await addDoc(collection(db, "feeTransactions"), newTransaction);
      
      // Update fee status
      const newPaidAmount = selectedFee.paidAmount + paymentData.amount;
      const newPendingAmount = selectedFee.totalAmount - newPaidAmount - paymentData.discount;
      
      await updateDoc(doc(db, "fees", selectedFee.id), {
        paidAmount: newPaidAmount,
        pendingAmount: newPendingAmount,
        discountAmount: selectedFee.discountAmount + paymentData.discount,
        status: newPendingAmount <= 0 ? "PAID" : "PARTIAL",
        updatedAt: new Date().toISOString(),
      });

      setReceipt({ id: txRef.id, ...newTransaction } as FeeTransaction);
      setStep(4);
      toast.success("Payment recorded successfully");
    } catch (error) {
      toast.error("Payment failed to process");
      console.error(error);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const totalCalculated = paymentData.amount + paymentData.lateFee - paymentData.discount;

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:max-w-none">
      <div className="print:hidden">
        <h2 className="text-2xl font-bold text-slate-800">Collect Fee</h2>
        <p className="text-slate-500 mt-1">Record a new payment for a student.</p>
      </div>

      <div className="print:hidden flex items-center gap-2 mb-8 text-sm font-medium">
        <span className={`\${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>1. Select Student</span>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className={`\${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>2. Select Fee</span>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className={`\${step >= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>3. Payment Details</span>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className={`\${step >= 4 ? 'text-indigo-600' : 'text-slate-400'}`}>4. Receipt</span>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by student name or roll number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
            />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNumber.includes(searchQuery)).map(student => (
              <div key={student.id} onClick={() => selectStudent(student)} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{student.name}</h4>
                    <p className="text-sm text-slate-500">Class {student.class} • Roll: {student.rollNumber}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selectedStudent && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600"><User className="w-5 h-5" /></div>
              <div>
                <h4 className="font-bold text-slate-900">{selectedStudent.name}</h4>
                <p className="text-sm text-slate-500">Class {selectedStudent.class} • Roll: {selectedStudent.rollNumber}</p>
              </div>
            </div>
            <button onClick={() => setStep(1)} className="text-sm text-indigo-600 font-medium hover:underline">Change</button>
          </div>

          <h3 className="text-lg font-bold text-slate-800 pt-2">Pending Dues</h3>
          <div className="space-y-4">
            {pendingFees.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-medium text-slate-800">No pending fees.</p>
                <p className="text-sm text-slate-500">This student has cleared all their dues.</p>
              </div>
            ) : (
              pendingFees.map(fee => (
                <div key={fee.id} className="p-5 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 hover:shadow-sm transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900">Term Fee - {fee.academicYear}</h4>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full \${fee.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {fee.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">Due on {new Date(fee.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Pending</p>
                      <p className="font-bold text-rose-600 text-lg">₹{fee.pendingAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={() => proceedToPayment(fee)} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
                      Pay Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {step === 3 && selectedFee && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">Payment Details</h3>
                <button onClick={() => setStep(2)} className="text-sm text-indigo-600 font-medium hover:underline">Back</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Paying Amount (₹)</label>
                  <input type="number" min="1" max={selectedFee.pendingAmount} value={paymentData.amount || ''} onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})} className="w-full p-3 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Late Fee (₹)</label>
                  <input type="number" min="0" value={paymentData.lateFee || ''} onChange={e => setPaymentData({...paymentData, lateFee: Number(e.target.value)})} className="w-full p-3 border border-slate-200 rounded-xl text-lg text-slate-900 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Discount (₹)</label>
                  <input type="number" min="0" max={paymentData.amount} value={paymentData.discount || ''} onChange={e => setPaymentData({...paymentData, discount: Number(e.target.value)})} className="w-full p-3 border border-slate-200 rounded-xl text-lg text-slate-900 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                  <select value={paymentData.paymentMethod} onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value as any})} className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500">
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference / Transaction ID</label>
                  <input type="text" value={paymentData.referenceNumber} onChange={e => setPaymentData({...paymentData, referenceNumber: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500" placeholder="Required for UPI/Card/Bank" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                  <textarea rows={2} value={paymentData.notes} onChange={e => setPaymentData({...paymentData, notes: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-sm p-6 sticky top-6">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Receipt className="w-5 h-5 text-indigo-500" /> Summary</h4>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-medium text-slate-900">₹{paymentData.amount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Late Fee</span><span className="font-medium text-slate-900">+ ₹{paymentData.lateFee.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-medium text-emerald-600">- ₹{paymentData.discount.toLocaleString()}</span></div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total Payable</span>
                  <span className="text-2xl font-black text-indigo-600">₹{totalCalculated.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={handlePayment} disabled={totalCalculated <= 0} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && receipt && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="p-8 border-b border-slate-100 text-center bg-emerald-50">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-900 mb-1">Payment Successful</h2>
              <p className="text-emerald-700 font-medium">₹{receipt.totalPayable.toLocaleString('en-IN')} received via {receipt.paymentMethod}</p>
            </div>
            
            {/* Printable Receipt Area */}
            <div className="p-8 bg-white print:p-0 print:border-0 print:shadow-none" ref={receiptRef}>
              <div className="text-center mb-8 border-b border-dashed border-slate-200 pb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">SchoolOS AI Academy</h1>
                <p className="text-sm text-slate-500 mt-1">123 Education Hub, Knowledge Park, New Delhi 110001</p>
                <div className="mt-6 inline-block bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Receipt Number</p>
                  <p className="font-mono font-medium text-slate-800">{receipt.receiptNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Student Details</p>
                  <p className="font-bold text-slate-900">{selectedStudent?.name}</p>
                  <p className="text-slate-600">Class {selectedStudent?.class}</p>
                  <p className="text-slate-600">Roll No: {selectedStudent?.rollNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 mb-1">Payment Info</p>
                  <p className="font-bold text-slate-900">{new Date(receipt.paymentDate).toLocaleDateString()}</p>
                  <p className="text-slate-600">{receipt.paymentMethod}</p>
                  {receipt.referenceNumber && <p className="text-slate-600 text-xs mt-1">Ref: {receipt.referenceNumber}</p>}
                </div>
              </div>

              <table className="w-full text-left border-t border-b border-slate-200 mb-8">
                <thead>
                  <tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
                    <th className="py-3 font-semibold">Description</th>
                    <th className="py-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr>
                    <td className="py-4 text-slate-800">Fee Payment</td>
                    <td className="py-4 text-right font-medium text-slate-900">₹{receipt.amount.toLocaleString()}</td>
                  </tr>
                  {receipt.lateFee > 0 && (
                    <tr>
                      <td className="py-4 text-slate-800">Late Fee</td>
                      <td className="py-4 text-right font-medium text-slate-900">₹{receipt.lateFee.toLocaleString()}</td>
                    </tr>
                  )}
                  {receipt.discount > 0 && (
                    <tr>
                      <td className="py-4 text-emerald-600">Discount Applied</td>
                      <td className="py-4 text-right font-medium text-emerald-600">- ₹{receipt.discount.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex justify-between items-end mb-12">
                <div>
                  <p className="text-xs text-slate-400">Received By</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">{receipt.collectedBy}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 mb-1">Total Amount Paid</p>
                  <p className="text-3xl font-black text-slate-900">₹{receipt.totalPayable.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 italic">This is a computer generated receipt.</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 print:hidden">
            <button onClick={() => {setStep(1); setSelectedStudent(null); setSelectedFee(null);}} className="px-6 py-3 rounded-xl font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">Record Another</button>
            <button onClick={printReceipt} className="px-6 py-3 rounded-xl font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-2"><Printer className="w-4 h-4" /> Print Receipt</button>
          </div>
        </div>
      )}
    </div>
  );
}
