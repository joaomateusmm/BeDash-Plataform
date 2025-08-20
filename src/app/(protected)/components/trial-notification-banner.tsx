import { AlertTriangle, Clock, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { getTrialNotification } from "@/actions/get-trial-notification";

/**
 * Banner de notificação sobre status do trial
 */
export async function TrialNotificationBanner() {
  const notification = await getTrialNotification();

  if (!notification.show) {
    return null;
  }

  const getVariant = () => {
    switch (notification.type) {
      case "expired":
        return "destructive" as const;
      case "danger":
        return "destructive" as const;
      case "warning":
        return "default" as const;
      default:
        return "default" as const;
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "expired":
        return <X className="h-4 w-4" />;
      case "danger":
        return <AlertTriangle className="h-4 w-4" />;
      case "warning":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case "expired":
        return "bg-red-50 border-red-200";
      case "danger":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <Alert className={`${getBgColor()} mb-6`} variant={getVariant()}>
      {getIcon()}
      <AlertTitle className="text-sm font-medium">
        {notification.title}
      </AlertTitle>
      <AlertDescription className="text-sm">
        <div className="mt-2 flex items-center justify-between">
          <span>{notification.message}</span>
          <Button
            size="sm"
            variant={notification.type === "warning" ? "outline" : "default"}
            className="ml-4 whitespace-nowrap"
          >
            {notification.ctaText}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
