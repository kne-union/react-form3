const { default: ReactForm, useField, useSubmit, useReset } = _ReactForm;

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

const BaseExample = () => {
  return (
    <div>
      <h3>基本表单示例</h3>
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
          alert('提交成功: ' + JSON.stringify(data, null, 2));
        }}
      >
        <Input name="name" label="名称" rule="REQ LEN-0-10" />
        <Input name="email" label="邮箱" rule="REQ EMAIL" />
        <Input name="phone" label="手机号" rule="REQ TEL" />
        <div>
          <SubmitButton>提交</SubmitButton>
          <ResetButton />
        </div>
      </ReactForm>
    </div>
  );
};

render(<BaseExample />);
