const { default: ReactForm, useField, useSubmit, useReset, GroupList } = _ReactForm;
const { useRef } = React;
const { Button, Divider, message } = antd;

const Input = props => {
  const fieldProps = useField(props);

  return (
    <div style={{ marginBottom: 16 }}>
      <label>{fieldProps.label}</label>
      <div>
        <input
          {...fieldProps.associationOptions}
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
  const ref = useRef(null);
  return (
    <div>
      <h3>字段关联示例</h3>
      <ReactForm
        debug
        onSubmit={data => {
          console.log('submit:', data);
          message.success('提交成功: ' + JSON.stringify(data, null, 2));
        }}
      >
        <div style={{ padding: 16, marginBottom: 20, background: '#f9f9f9', borderRadius: 8 }}>
          <h4>1. 单字段关联 - 描述跟随名称</h4>
          <Input name="name" label="名称" rule="REQ LEN-0-10" />
          <Input
            name="des"
            label="描述"
            rule="LEN-0-10"
            associations={{
              fields: [{ name: 'name' }],
              callback: ({ target, origin }) => {
                return origin.value;
              }
            }}
          />
        </div>

        <Divider />

        <div style={{ padding: 16, marginBottom: 20, background: '#f9f9f9', borderRadius: 8 }}>
          <h4>2. 多字段关联 - 姓名拼接全名</h4>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Input name="familyName" label="姓" rule="REQ LEN-0-10" />
            <Input name="firstName" label="名" rule="REQ LEN-0-10" />
          </div>
          <Input
            name="fullName"
            label="全名"
            rule="LEN-0-20"
            associations={{
              fields: [{ name: 'familyName' }, { name: 'firstName' }],
              callback: ({ target, openApi }) => {
                const { firstName, familyName } = openApi.getFormData();
                return firstName && familyName ? `${familyName}${firstName}` : '';
              }
            }}
          />
        </div>

        <Divider />

        <div style={{ padding: 16, marginBottom: 20, background: '#f9f9f9', borderRadius: 8 }}>
          <h4>3. 计算关联 - 金额除以比例</h4>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Input name="money" label="总金额" />
            <Input name="ratio" label="比例" />
          </div>
          <Input
            name="all"
            label="每份金额"
            associations={{
              fields: [{ name: 'money' }, { name: 'ratio' }],
              callback: ({ target, openApi }) => {
                const { money, ratio } = openApi.getFormData();
                const numMoney = parseFloat(money) || 0;
                const numRatio = parseFloat(ratio) || 1;
                return numRatio > 0 ? (numMoney / numRatio).toFixed(2) : '';
              }
            }}
          />
        </div>

        <Divider />

        <div style={{ padding: 16, marginBottom: 20, background: '#f9f9f9', borderRadius: 8 }}>
          <h4>4. 分组关联 - 汇总求和</h4>
          <Button type="primary" onClick={() => ref.current.onAdd()} style={{ marginBottom: 12 }}>
            添加数量项
          </Button>
          <GroupList ref={ref} name="group" defaultLength={2}>
            {({ index, onRemove }) => (
              <div
                key={index}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  background: '#e8e8e8',
                  borderRadius: 4,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center'
                }}
              >
                <span>项 {index + 1}</span>
                <Input name="sum" label="数量" />
                <Button danger size="small" onClick={onRemove}>
                  删除
                </Button>
              </div>
            )}
          </GroupList>
          <Input
            name="amount"
            label="总数"
            associations={{
              fields: [{ name: 'sum', groupName: 'group' }],
              callback: ({ target, openApi }) => {
                const { group } = openApi.getFormData();
                const total = (group || [])
                  .filter(item => item.sum > 0)
                  .reduce((a, b) => a + parseInt(b.sum), 0);
                return total > 0 ? total.toString() : '';
              }
            }}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <SubmitButton>提交</SubmitButton>
          <ResetButton />
        </div>
      </ReactForm>
    </div>
  );
};

render(<BaseExample />);
