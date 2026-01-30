import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { VisitReceipt } from '@/types/queue';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Calendar,
  User,
  Stethoscope,
  FileText,
  Download,
  Pill
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQueue } from '@/context/QueueContext';

interface ReceiptCardProps {
  receipt: VisitReceipt;
  onScan?: () => void;
}

const statusConfig = {
  active: {
    label: 'Active',
    icon: CheckCircle2,
    className: 'text-success bg-success/10',
  },
  fulfilled: {
    label: 'Already Fulfilled',
    icon: AlertTriangle,
    className: 'text-warning bg-warning/10',
  },
  invalid: {
    label: 'Invalid',
    icon: XCircle,
    className: 'text-destructive bg-destructive/10',
  },
};

export function ReceiptCard({ receipt, onScan }: ReceiptCardProps) {
  const { getPrescription } = useQueue();
  const config = statusConfig[receipt.status];
  const StatusIcon = config.icon;
  
  // Get prescription details if available
  const prescription = receipt.prescriptionId ? getPrescription(receipt.prescriptionId) : null;
  
  const qrValue = JSON.stringify({
    receiptId: receipt.id,
    patientName: receipt.patientName,
    visitDate: receipt.visitDate,
    status: receipt.status,
    prescriptionToken: prescription?.tokenNumber,
  });

  const handleDownload = () => {
    // Create a simple text receipt for demo
    let receiptText = `
╔══════════════════════════════════════════╗
║          HealthQueue+ Receipt            ║
╠══════════════════════════════════════════╣
║                                          ║
║  Patient: ${receipt.patientName.padEnd(28)}║
║  Date: ${format(receipt.visitDate, 'PPP').padEnd(31)}║
║  Time: ${format(receipt.visitDate, 'p').padEnd(31)}║
║  Doctor: ${receipt.doctorRole.padEnd(29)}║
║  Visit Type: ${receipt.visitType.padEnd(25)}║
║  Status: COMPLETED                       ║
║                                          ║`;

    if (prescription) {
      receiptText += `
║  ═══════════════════════════════════════ ║
║  E-PRESCRIPTION DETAILS                  ║
║  ═══════════════════════════════════════ ║
║                                          ║
║  Prescription Token: ${prescription.tokenNumber.padEnd(19)}║
║  Diagnosis: ${prescription.diagnosis.substring(0, 27).padEnd(27)}║
║  Medicines: ${prescription.medicines.length} item(s)                      ║
`;
      prescription.medicines.forEach((med, idx) => {
        receiptText += `║  ${(idx + 1)}. ${med.name.substring(0, 35).padEnd(35)}║
`;
      });
      receiptText += `║                                          ║
║  Status: ${prescription.status.toUpperCase().padEnd(30)}║
║                                          ║`;
      
      if (prescription.status === 'forwarded') {
        receiptText += `
║  ⚠ COLLECT AT MEDICINE DEPARTMENT        ║
║  Show token: ${prescription.tokenNumber.padEnd(24)}║
`;
      }
    }

    receiptText += `
║                                          ║
║  Receipt ID: ${receipt.id.slice(0, 8)}...              ║
║                                          ║
╚══════════════════════════════════════════╝
    `;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
        {/* Header */}
        <div className="gradient-success p-6 text-center">
          <h1 className="text-2xl font-bold text-primary-foreground">HealthQueue+</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Smart Visit Receipt</p>
        </div>

        {/* Status Banner */}
        <div className={cn('flex items-center justify-center gap-2 py-3 px-4', config.className)}>
          <StatusIcon className="w-5 h-5" />
          <span className="font-semibold">{config.label}</span>
          {receipt.scanCount > 0 && (
            <span className="text-sm ml-2">
              (Scanned {receipt.scanCount} time{receipt.scanCount > 1 ? 's' : ''})
            </span>
          )}
        </div>

        {/* Fraud Alert */}
        {receipt.scanCount > 1 && (
          <div className="bg-destructive/10 border-destructive/20 border-y p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Anti-Fraud Alert</p>
              <p className="text-sm text-destructive/80">
                This receipt has been scanned multiple times. Possible duplicate usage detected.
              </p>
            </div>
          </div>
        )}

        {/* Receipt Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <User className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Patient Name</p>
              <p className="font-semibold">{receipt.patientName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Visit Date & Time</p>
              <p className="font-semibold">{format(receipt.visitDate, 'PPP p')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Stethoscope className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Doctor Role</p>
              <p className="font-semibold">{receipt.doctorRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Visit Type</p>
              <p className="font-semibold capitalize">{receipt.visitType}</p>
            </div>
          </div>

          {/* E-Prescription Information */}
          {prescription && (
            <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">E-Prescription Available</h3>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded">
                  <span className="text-sm text-muted-foreground">Prescription Token</span>
                  <Badge className="font-mono font-bold text-base bg-green-600 hover:bg-green-700">
                    {prescription.tokenNumber}
                  </Badge>
                </div>
                
                <div className="p-2 bg-white dark:bg-gray-900 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Diagnosis</p>
                  <p className="text-sm font-medium">{prescription.diagnosis}</p>
                </div>
                
                <div className="p-2 bg-white dark:bg-gray-900 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Medicines ({prescription.medicines.length})</p>
                  <div className="space-y-1">
                    {prescription.medicines.map((med, idx) => (
                      <p key={idx} className="text-sm">• {med.name}</p>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant={
                    prescription.status === 'dispensed' ? 'default' :
                    prescription.status === 'forwarded' ? 'secondary' : 'outline'
                  } className={
                    prescription.status === 'dispensed' ? 'bg-green-600' :
                    prescription.status === 'forwarded' ? 'bg-blue-500' : ''
                  }>
                    {prescription.status === 'dispensed' ? '✓ Dispensed' :
                     prescription.status === 'forwarded' ? '→ Ready for Collection' :
                     prescription.status === 'verified' ? '✓ Verified' : 'Pending'}
                  </Badge>
                </div>
              </div>
              
              {prescription.status === 'forwarded' && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                  <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-900 dark:text-blue-100">
                    <p className="font-semibold mb-1">Collect Medicines at Medicine Department</p>
                    <p>Show token <span className="font-mono font-bold">{prescription.tokenNumber}</span> to pharmacy staff</p>
                  </div>
                </div>
              )}
              
              {prescription.status === 'dispensed' && (
                <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-950/30 rounded">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-900 dark:text-green-100 font-medium">
                    Medicines collected on {prescription.dispensedAt ? format(prescription.dispensedAt, 'PPp') : 'N/A'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="p-6 pt-0">
          <div className="bg-white p-4 rounded-lg border flex flex-col items-center">
            <QRCodeSVG
              value={qrValue}
              size={160}
              level="H"
              includeMargin
            />
            <p className="text-xs text-muted-foreground mt-2">
              Scan to verify receipt
            </p>
            {onScan && (
              <Button
                variant="outline"
                size="sm"
                onClick={onScan}
                className="mt-3"
              >
                Simulate Scan
              </Button>
            )}
          </div>
        </div>

        {/* Receipt ID */}
        <div className="px-6 pb-4">
          <p className="text-xs text-center text-muted-foreground">
            Receipt ID: <span className="font-mono">{receipt.id}</span>
          </p>
        </div>

        {/* Download Button */}
        <div className="p-4 border-t bg-muted/50">
          <Button onClick={handleDownload} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
