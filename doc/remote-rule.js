const { default: ReactForm, useField, useSubmit, useReset } = _ReactForm;
const { message } = antd;

const Input = props => {
  const fieldProps = useField(props);

  return (
    <div style={{ marginBottom: 16 }}>
      <label>{fieldProps.label}</label>
      <div>
        <input
          ref={fieldProps.fieldRef}
          type="text"
          value={fieldProps.value || ''}
          onChange={fieldProps.onChange}
          onBlur={fieldProps.triggerValidate}
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4, width: 200 }}
        />
        {fieldProps.errMsg && <span style={{ color: 'red', marginLeft: 8 }}>{fieldProps.errMsg}</span>}
        {fieldProps.errState === 3 && <span style={{ color: '#1890ff', marginLeft: 8 }}>验证中...</span>}
      </div>
    </div>
  );
};

const SubmitButton = ({ children }) => {
  const { isLoading, isPass, onClick } = useSubmit();
  return (
    <button onClick={onClick} disabled={isLoading || !isPass} style={{ padding: '8px 16px', marginRight: 8 }}>
      {isLoading ? '提交中...' : children}
    </button>
  );
};

const ResetButton = () => {
  const { onClick } = useReset();
  return <button onClick={onClick} style={{ padding: '8px 16px' }}>重置</button>;
};

// 模拟用户名重复检查的远程验证规则
const checkUsernameUnique = async value => {
  if (!value) {
    return { result: false, errMsg: '用户名不能为空' };
  }

  // 模拟已存在的用户名
  const existingUsernames = ['admin', 'test', 'user', 'root'];

  console.log(`开始验证用户名: ${value}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log(`验证完成用户名: ${value}`);

  if (existingUsernames.includes(value)) {
    return { result: false, errMsg: '该用户名已被占用' };
  }

  return { result: true, errMsg: '' };
};

// 模拟手机号有效性检查的远程验证规则
const checkPhoneValid = async value => {
  if (!value) {
    return { result: false, errMsg: '手机号不能为空' };
  }

  console.log(`开始验证手机号: ${value}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`验证完成手机号: ${value}`);

  // 模拟手机号黑名单
  const blackList = ['13800138000', '13900139000'];

  if (blackList.includes(value)) {
    return { result: false, errMsg: '该手机号已被注册' };
  }

  return { result: true, errMsg: '' };
};

const BaseExample = () => {
  return (
    <div>
      <h3>远程验证规则示例</h3>
      <p style={{ color: '#666', marginBottom: 20 }}>
        示例展示了如何使用自定义的异步验证规则来模拟远程接口验证
      </p>

      <ReactForm
        debug
        rules={{
          CHECK_USERNAME: checkUsernameUnique,
          CHECK_PHONE: checkPhoneValid
        }}
        data={{
          username: '',
          phone: ''
        }}
        onSubmit={async data => {
          console.log('提交数据:', data);
          await new Promise(resolve => setTimeout(resolve, 2000));
          message.success('注册成功: ' + JSON.stringify(data, null, 2));
        }}
      >
        <Input
          name="username"
          label="用户名"
          rule="REQ LEN-3-20 CHECK_USERNAME"
          placeholder="请输入用户名 (避免使用: admin, test, user, root)"
        />
        <Input
          name="phone"
          label="手机号"
          rule="REQ TEL CHECK_PHONE"
          placeholder="请输入手机号 (避免使用: 13800138000, 13900139000)"
        />

        <div style={{ marginTop: 20 }}>
          <SubmitButton>注册</SubmitButton>
          <ResetButton />
        </div>
      </ReactForm>
    </div>
  );
};

render(<BaseExample />);
