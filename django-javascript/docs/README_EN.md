# Toss Payments Django Integration Sample (WebView) - English README

## Project Introduction

This project is a sample demonstrating how to integrate various Toss Payments methods with a Django backend. It is specifically configured assuming a scenario where the payment module is used within a mobile app's WebView environment.

It includes an auto-generated API documentation feature using Swagger, helping frontend developers easily check and integrate with the API endpoints.

## Key Features

*   **Toss Payments Integration:**
    *   Payment Widget
    *   Payment Window (General Payment)
    *   BrandPay
    *   Billing / Recurring Payment
*   **Auto-generated API Documentation:**
    *   Swagger UI: Available at `/swagger/` path
    *   ReDoc UI: Available at `/redoc/` path

## Installation and Execution

1.  **Clone Repository:**
    ```bash
    # git clone ... (repository address)
    # cd car-services-backend/django-javascript
    ```

2.  **Create Virtual Environment and Install Dependencies:** (First time only)
    *   If a virtual environment (`.venv`) doesn't exist in the project directory (`car-services-backend/django-javascript`), create one.
        ```bash
        python3 -m venv .venv
        ```
    *   Install dependencies:
        ```bash
        ./.venv/bin/pip install -r requirements.txt
        ```
        (Ensure `requirements.txt` includes `django`, `requests`, `drf-yasg`, and `djangorestframework`.)

3.  **Database Migration:** (Optional: Required if using built-in features like Django admin)
    ```bash
    ./.venv/bin/python manage.py migrate
    ```

4.  **Configure Secret Key / Client Key:**
    *   **Caution:** Test keys are hardcoded in `payments/views.py` and template (`*.checkout.html`) files.
        *   **Secret Key (`payments/views.py`):** For actual service, do not put the secret key directly in the code. Manage it securely using environment variables or a separate configuration file.
        *   **Client Key (`*.checkout.html`):** Replace the test client key in each template file with your actual production or test key.
    *   Use your own keys issued from the Toss Payments Developer Center for development and testing.

5.  **Run Development Server:**
    *   Navigate to the project root directory (`car-services-backend`) and run the `run_django.py` script.
        ```bash
        cd .. # Move to car-services-backend directory
        python3 run_django.py
        ```
    *   This script uses the virtual environment to run the Django development server on port 8001.

6.  **Verify Access:**
    *   Access `http://127.0.0.1:8001/swagger/` in a web browser to view the API documentation.
    *   You can load payment test pages by accessing URLs like `http://127.0.0.1:8001/widget/checkout`. (Note: Payment initiation requires data transfer from the app.)

## API Endpoints

Detailed API specifications can be found at the `/swagger/` or `/redoc/` paths. Key endpoint roles are:

*   `POST /issue-billing-key`: Request card billing key issuance (for recurring payments)
*   `POST /confirm-billing`: Request automatic payment confirmation (using saved billing key)
*   `GET /callback-auth`: Issue BrandPay Access Token (authentication callback)
*   `GET /widget/success`: Handle Payment Widget success (Success URL)
*   `GET /payment/success`: Handle General Payment success (Success URL)
*   `GET /brandpay/success`: Handle BrandPay success (Success URL)
*   `GET /fail`: Handle payment failure (Fail URL)

## WebView Integration Guide (React Native Environment Reference)

This Django project provides a payment module for a React Native app's WebView environment. Interaction between the app and the WebView follows these interfaces:

1.  **Initial Information Receiving Interface (Django WebView → React Native App):**
    *   **Expectations of Django WebView Page (`payments/templates/*checkout.html`):**
        *   Checkout HTML pages define a JavaScript function: `initializePayment(jsonDataString)`.
        *   The React Native app, after loading the WebView, is expected to call this function, passing necessary payment information (Order ID, Amount, `customerKey`, etc.) as a JSON formatted string in the `jsonDataString` argument.
        *   **TODO Check:** The `initializePayment` function contains TODO comments regarding `clientKey` (test key) and `customerKey`. These must be addressed for the actual service environment.
            *   `clientKey`: Replace the test key in the code with the actual key.
            *   `customerKey`: The value passed from the app must be a secure and unique user identifier.
        *   Once the function is called with the necessary data, it initializes the Toss Payments SDK and renders the payment UI to start the payment process.

2.  **Payment Result Return Interface (Django WebView → React Native App):**
    *   **Behavior of Django WebView Page (`payments/templates/*success.html`, `fail.html`):**
        *   After Toss Payments processes the payment and redirects to the result page, the page automatically calls the `window.ReactNativeWebView.postMessage(message)` JavaScript function upon loading (when detecting the React Native WebView environment).
        *   This function transmits a JSON formatted string message containing the payment result (success/failure) and related data to the React Native app.
        *   The format of the transmitted message is:
            ```json
            // On Success
            {"type":"paymentResult","status":"success","payload":{"orderId":"...","paymentKey":"...","totalAmount":"..."}}
            // On Failure
            {"type":"paymentResult","status":"fail","payload":{"code":"...","message":"..."}}
            ```
    *   **Role of React Native App (Reference):**
        *   The app should use the `onMessage` feature of the `WebView` component to receive this message, parse it, and perform subsequent actions based on the result.

3.  **Success / Fail URL Configuration (Reference):**
    *   The `successUrl` and `failUrl` configured in the Toss Payments SDK initialization within the Django WebView page JavaScript are used for internal page navigation within the WebView. The final result is communicated to the app via the `postMessage` interface.

## Important Notes

*   **Key Management:** Manage secret keys securely; never expose them in code or version control. Replace test client keys with appropriate ones for your environment.
*   **Testing:** Thoroughly test various payment scenarios and edge cases before deploying to production.
*   **Communication Protocol:** Clearly coordinate the exact data format and handling procedures between the WebView and the app with the frontend developer.

## Others

In the current state, payment testing is not possible without data transfer from the app (calling `initializePayment`). For testing, you can manually call the `initializePayment` function from the browser developer tools console or refer to the official Toss Payments sample project. (https://github.com/tosspayments/tosspayments-sample) 