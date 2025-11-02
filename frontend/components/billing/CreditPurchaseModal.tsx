// FILE: /AutoStudio/frontend/components/billing/CreditPurchaseModal.tsx
// DESCRIPTION: Modal for purchasing credits

'use client';

import { useState } from 'react';
import { Check, Zap, CreditCard, Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreditPackage {
  credits: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

const creditPackages: CreditPackage[] = [
  { credits: 50, price: 5 },
  { credits: 100, price: 10, bonus: 10 },
  { credits: 250, price: 20, bonus: 30, popular: true },
  { credits: 500, price: 35, bonus: 75 },
  { credits: 1000, price: 60, bonus: 200 },
  { credits: 2500, price: 125, bonus: 625 },
];

const paymentMethods = [
  { id: 'stripe', name: 'Credit Card', icon: CreditCard, available: true },
  { id: 'momo', name: 'MoMo', icon: Wallet, available: true },
  { id: 'zalopay', name: 'ZaloPay', icon: Wallet, available: true },
  { id: 'vnpay', name: 'VNPay', icon: Wallet, available: true },
];

interface CreditPurchaseModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreditPurchaseModal({ open, onClose }: CreditPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(creditPackages[2]);
  const [selectedPayment, setSelectedPayment] = useState<string>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      // TODO: Implement payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(
        `Successfully purchased ${selectedPackage.credits}${selectedPackage.bonus ? ` + ${selectedPackage.bonus} bonus` : ''} credits!`,
      );
      
      onClose();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalCredits = selectedPackage.credits + (selectedPackage.bonus || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Purchase Credits</DialogTitle>
          <DialogDescription>
            Choose a credit package to continue creating amazing content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Credit Packages */}
          <div>
            <h3 className="font-semibold mb-3">Select Package</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {creditPackages.map((pkg) => (
                <button
                  key={pkg.credits}
                  onClick={() => setSelectedPackage(pkg)}
                  className={cn(
                    'relative p-4 rounded-lg border-2 transition-all text-left',
                    selectedPackage.credits === pkg.credits
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50',
                    pkg.popular && 'ring-2 ring-primary ring-offset-2',
                  )}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold">{pkg.credits}</span>
                  </div>

                  {pkg.bonus && (
                    <div className="text-sm text-green-600 font-medium mb-1">
                      + {pkg.bonus} bonus credits
                    </div>
                  )}

                  <div className="text-xl font-bold">${pkg.price}</div>
                  <div className="text-xs text-muted-foreground">
                    ${(pkg.price / (pkg.credits + (pkg.bonus || 0))).toFixed(3)} per credit
                  </div>

                  {selectedPackage.credits === pkg.credits && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold mb-3">Payment Method</h3>
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <RadioGroupItem
                      value={method.id}
                      id={method.id}
                      className="peer sr-only"
                      disabled={!method.available}
                    />
                    <Label
                      htmlFor={method.id}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                        'peer-checked:border-primary peer-checked:bg-primary/5',
                        !method.available && 'opacity-50 cursor-not-allowed',
                      )}
                    >
                      <method.icon className="w-5 h-5" />
                      <span className="font-medium">{method.name}</span>
                      {!method.available && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          Coming soon
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Summary */}
          <div className="p-4 bg-accent/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Credits</span>
              <span className="font-medium">{selectedPackage.credits}</span>
            </div>
            
            {selectedPackage.bonus && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bonus Credits</span>
                <span className="font-medium text-green-600">+{selectedPackage.bonus}</span>
              </div>
            )}

            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Total Credits</span>
              <span className="text-lg font-bold">{totalCredits}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold">Total Price</span>
              <span className="text-2xl font-bold">${selectedPackage.price}</span>
            </div>
          </div>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full h-12 text-lg"
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              `Purchase ${totalCredits} Credits for $${selectedPackage.price}`
            )}
          </Button>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            By purchasing, you agree to our{' '}
            <a href="/terms" className="underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/refund-policy" className="underline">
              Refund Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}