import logging
import time

class GracefulDegradation:
    def __init__(self, mode="fail-open", alert_callback=None):
        """
        mode = "fail-open"  → allow traffic even on failure
        mode = "fail-closed" → block traffic on failure
        alert_callback → function to notify operators
        """
        self.mode = mode
        self.alert_callback = alert_callback

        logging.basicConfig(
            filename="degradation.log",
            level=logging.INFO,
            format="%(asctime)s - %(message)s"
        )

    def process_request(self, traffic_ok=True):
        """
        traffic_ok = False means system is overloaded
        """

        if traffic_ok:
            return True  # system working normally

        # System is failing → degrade gracefully
        logging.info(f"Degradation event occurred. Mode={self.mode}")

        if self.alert_callback:
            self.alert_callback("System overloaded! Degradation triggered.")

        if self.mode == "fail-open":
            return True  # allow traffic even during overload
        else:
            return False  # block traffic

# Example usage
if __name__ == "__main__":
    def send_alert(msg):
        print("ALERT TO OPERATORS:", msg)

    gd = GracefulDegradation(mode="fail-open", alert_callback=send_alert)

    print("Normal request:", gd.process_request(traffic_ok=True))     # True
    print("Overloaded request:", gd.process_request(traffic_ok=False)) # True or False based on mode
