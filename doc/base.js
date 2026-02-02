const { default: ReactForm, useField, useSubmit, useReset } = _ReactForm;
const { Input: AntInput, Button, Space, Card, Alert, Typography, message } = antd;
const { Text } = Typography;

// ========================================
// 通用组件
// ========================================

const Input = props => {
  const fieldProps = useField(props);
  const isError = fieldProps.errState === 2;
  const isValidating = fieldProps.errState === 3;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <Text type={isError ? 'danger' : undefined}>{fieldProps.label}</Text>
      </div>
      <div>
        <AntInput
          ref={fieldProps.fieldRef}
          type={props.type || 'text'}
          value={fieldProps.value || ''}
          onChange={e => fieldProps.onChange(e.target.value)}
          onBlur={fieldProps.triggerValidate}
          placeholder={props.placeholder}
          status={isError ? 'error' : undefined}
          style={{ width: props.width || 200 }}
        />
        {fieldProps.errMsg && (
          <Text type="danger" style={{ marginLeft: 8, fontSize: 12 }}>
            {fieldProps.errMsg}
          </Text>
        )}
        {isValidating && (
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
            验证中...
          </Text>
        )}
      </div>
    </div>
  );
};

const SubmitButton = ({ children, isPassButton = false }) => {
  const { isLoading, isPass, onClick } = useSubmit();
  return (
    <Button
      type="primary"
      onClick={onClick}
      disabled={isPassButton ? (isLoading || !isPass) : isLoading}
      loading={isLoading}
    >
      {children}
    </Button>
  );
};

const ResetButton = () => {
  const { onClick } = useReset();
  return <Button onClick={onClick}>重置</Button>;
};

// ========================================
// 基本表单示例
// ========================================

const BaseExample = () => {
  return (
    <Card title="基本表单示例" style={{ marginBottom: 24 }}>
      <ReactForm
        debug
        data={{ name: '哈哈哈' }}
        onSubmit={async data => {
          await new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 3000);
          });
          console.log('submit:', data);
          message.success('提交成功: ' + JSON.stringify(data, null, 2));
        }}
      >
        <Input name="name" label="名称" rule="REQ LEN-0-10" />
        <Input name="email" label="邮箱" rule="REQ EMAIL" />
        <Input name="phone" label="手机号" rule="REQ TEL" />
        <Space>
          <SubmitButton>提交</SubmitButton>
          <ResetButton />
        </Space>
      </ReactForm>
    </Card>
  );
};

// ========================================
// isPass 测试示例
// ========================================

const IsPassStatusDisplay = () => {
  const { isPass } = useSubmit();
  return (
    <Alert
      message={`表单验证状态：${isPass ? '全部通过' : '存在错误'}`}
      description={isPass ? '所有字段验证通过，可以提交' : '请检查并修正错误信息'}
      type={isPass ? 'success' : 'error'}
      showIcon
      style={{ marginBottom: 20 }}
    />
  );
};

const IsPassExample = () => {
  return (
    <Card title="isPass 测试示例" extra={
      <Text type="secondary" style={{ fontSize: 12 }}>
        所有字段在输入停止后（失焦）触发校验
      </Text>
    }>
      <ReactForm
        debug
        data={{
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          age: ''
        }}
        onSubmit={async data => {
          await new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 1000);
          });
          console.log('submit:', data);
          message.success('提交成功: ' + JSON.stringify(data, null, 2));
        }}
      >
        <IsPassStatusDisplay />

        <div style={{ marginBottom: 16 }}>
          <Text strong>基本信息</Text>
        </div>
        <Input
          name="username"
          label="用户名"
          rule="REQ LEN-3-20"
          placeholder="请输入用户名（3-20字符）"
          width={250}
        />
        <Input
          name="email"
          label="邮箱"
          rule="REQ EMAIL"
          placeholder="请输入邮箱地址"
          width={250}
        />
        <Input
          name="age"
          label="年龄"
          rule="REQ LEN-1-3"
          placeholder="请输入年龄（1-3位数字）"
          width={250}
        />

        <div style={{ marginBottom: 16, marginTop: 16 }}>
          <Text strong>安全信息</Text>
        </div>
        <Input
          name="password"
          label="密码"
          rule="REQ LEN-6-20"
          placeholder="请输入密码（6-20字符）"
          type="password"
          width={250}
        />
        <Input
          name="confirmPassword"
          label="确认密码"
          rule="REQ LEN-6-20"
          placeholder="请再次输入密码"
          type="password"
          width={250}
        />

        <SubmitButton isPassButton>提交注册</SubmitButton>
      </ReactForm>
    </Card>
  );
};

// ========================================
// 主组件
// ========================================

const App = () => {
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <BaseExample />
        <IsPassExample />
      </Space>
    </div>
  );
};

render(<App />);
