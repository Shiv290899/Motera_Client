import React from "react";
import { getOwnerOrgName } from "../utils/ownerConfig";
import { Button, Form, Input, Checkbox, Typography, message, Alert } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./auth.css";
import { RegisterUser } from "../apiCalls/users";

const { Title, Text } = Typography;

function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  // Local message instance to guarantee context
  const [msgApi, msgCtx] = message.useMessage();

  const inviteToken = React.useMemo(() => {
    try {
      const params = new URLSearchParams(location.search || "");
      return String(params.get("invite") || "").trim();
    } catch {
      return "";
    }
  }, [location.search]);

  const onFinish = async (values) => {
    setSubmitError("");
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
      ...(inviteToken ? { inviteToken } : {}),
    };

    try {
      setLoading(true);
      const data = await RegisterUser(payload);
      if (data?.success) {
        msgApi.success("Registration successful! Please login.");
        navigate("/login");
      } else if (data?.code === 409) {
        // Friendly duplicate case from API helper
        const warnMsg = data?.message || "Email or mobile already registered.";
        setSubmitError(warnMsg);
        msgApi.warning(warnMsg);
      } else if (data && data.success === false) {
        const errMsg = data?.message || "Registration failed. Try again.";
        setSubmitError(errMsg);
        msgApi.error(errMsg);
      } else {
        // Fallback when helper threw nothing but result is unexpected
        const errMsg = "Registration failed. Please try again.";
        setSubmitError(errMsg);
        msgApi.error(errMsg);
      }
    } catch (err) {
      const status = err?.response?.status;
      const apiMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setSubmitError(apiMsg);
      if (status === 409) {
        msgApi.warning(apiMsg);
      } else {
        msgApi.error(apiMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = () => {
    message.warning("Please fix the errors in the form.");
  };

  return (
    <div className="auth-container">
      {msgCtx}
      <div className="auth-box">
        <Title level={2} className="title">Create your account</Title>
        <Text type="secondary" className="subtitle">
          Join {getOwnerOrgName() || "Motera"} to manage bookings and more.
          {inviteToken ? " (Invite link detected)" : ""}
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          onValuesChange={() => { if (submitError) setSubmitError(""); }}
          className="auth-form"
          requiredMark={false}
        >
          {submitError ? (
            <Alert
              type="warning"
              showIcon
              message={submitError}
              style={{ marginBottom: 12 }}
            />
          ) : null}

          {/* Name */}
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              { required: true, message: "Name is required" },
              { min: 2, message: "Please enter a valid name" },
            ]}
          >
            <Input size="large" placeholder="Enter your full name" className="input-field" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input size="large" type="email" placeholder="name@example.com" className="input-field" />
          </Form.Item>

          {/* Phone (India 10-digit) */}
          <Form.Item
            label="Mobile Number"
            name="phone"
            rules={[
              { required: true, message: "Mobile number is required" },
              { pattern: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit Indian number" },
            ]}
          >
            <Input size="large" placeholder="9876543210" maxLength={10} className="input-field" />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 6, message: "At least 6 characters" },
            ]}
            hasFeedback
          >
            <Input.Password size="large" placeholder="Create a password" className="input-field" />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            label="Confirm Password"
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Re-enter your password" className="input-field" />
          </Form.Item>

          {/* Terms and Conditions */}
          <div className="terms-container">
            <h5>1. Introduction</h5>
            <p>
              Welcome to {getOwnerOrgName() || "Motera"}. By creating an
              account, you agree to be bound by these Terms and Conditions.
            </p>
            <h5>2. Data Privacy and Communication</h5>
            <p>
              We collect personal information such as your name, email, and
              phone number to provide and improve our services. By registering,
              you consent to us contacting you via Email, SMS, and/or WhatsApp
              for service reminders, booking confirmations, and promotional
              offers. You may opt-out of promotional messages at any time.
            </p>
            <h5>3. User Account</h5>
            <p>
              You are responsible for maintaining the confidentiality of your
              account and password. You agree to accept responsibility for all
              activities that occur under your account.
            </p>
            <h5>4. Service Bookings and Payments</h5>
            <p>
              All bookings for vehicle services are subject to availability and
              our confirmation. Payment for all services is due upon completion
              as specified in the job card or invoice.
            </p>
            <h5>5. Limitation of Liability</h5>
            <p>
              {getOwnerOrgName() || "Motera"} will not be liable for any
              indirect, incidental, or consequential loss or damages arising from
              the use of our services. Our total liability is limited to the
              amount paid by you for the specific service.
            </p>
            <h5>6. Governing Law</h5>
            <p>
              These terms are governed by the laws of India. Any disputes will
              be subject to the exclusive jurisdiction of the courts in your
              local area.
            </p>
          </div>

          <Form.Item
            name="terms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("You must accept the terms and conditions")
                      ),
              },
            ]}
          >
            <Checkbox>
              I have read and agree to the Terms and Conditions.
            </Checkbox>
          </Form.Item>

          {/* Submit */}
          <Button
            type="primary"
            block
            size="large"
            htmlType="submit"
            className="auth-button"
            loading={loading}
          >
            Register
          </Button>
        </Form>

        <p className="switch-text">
          Already a user? <Link to="/login" className="link-strong">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
