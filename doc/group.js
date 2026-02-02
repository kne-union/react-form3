const { default: ReactForm, useField, useSubmit, useReset, GroupList } = _ReactForm;
const { useRef } = React;
const { Button, Space, Card, Input: AntInput, Tag, Typography, message } = antd;
const { Text } = Typography;

const Input = props => {
  const fieldProps = useField(props);
  const isError = fieldProps.errState === 2;
  const isValidating = fieldProps.errState === 3;

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ marginBottom: 4 }}>
        <Text type={isError ? 'danger' : undefined} style={{ fontSize: 12 }}>
          {fieldProps.label}
        </Text>
      </div>
      <div>
        <AntInput
          ref={fieldProps.fieldRef}
          type="text"
          value={fieldProps.value || ''}
          onChange={e => fieldProps.onChange(e.target.value)}
          onBlur={fieldProps.triggerValidate}
          status={isError ? 'error' : undefined}
          size="small"
          style={{ width: 120 }}
        />
        {fieldProps.errMsg && (
          <Text type="danger" style={{ marginLeft: 4, fontSize: 12 }}>
            {fieldProps.errMsg}
          </Text>
        )}
        {isValidating && (
          <Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
            验证中...
          </Text>
        )}
      </div>
    </div>
  );
};

const SubmitButton = ({ children }) => {
  const { isLoading, onClick } = useSubmit();
  return (
    <Button type="primary" onClick={onClick} loading={isLoading} style={{ marginRight: 8 }}>
      {children}
    </Button>
  );
};

const ResetButton = () => {
  const { onClick } = useReset();
  return <Button onClick={onClick}>重置</Button>;
};

const BaseExample = () => {
  const ref = useRef();
  const formApiRef = useRef();

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="动态分组示例" bordered={false}>
        <Space wrap style={{ marginBottom: 20 }}>
          <Button
            type="primary"
            onClick={() => {
              formApiRef.current.setField({
                name: 'name',
                groupName: 'group',
                groupIndex: 0,
                value: '第一项名称'
              });
            }}>
            设置第一项名称
          </Button>
          <Button
            onClick={() => {
              formApiRef.current.setField({
                name: 'name',
                groupName: 'group',
                value: '所有项名称'
              });
            }}>
            设置所有项名称
          </Button>
          <Button
            onClick={() => {
              formApiRef.current.setFormData({
                group: [
                  { name: '张三', des: '描述1' },
                  { name: '李四', des: '描述2' },
                  { name: '王五', des: '描述3' }
                ]
              });
            }}>
            批量设置数据
          </Button>
        </Space>
        <ReactForm
          ref={formApiRef}
          onSubmit={data => {
            console.log('submit:', data);
            message.success('提交成功: ' + JSON.stringify(data, null, 2));
          }}>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => ref.current.onAdd()}>
              添加到开头
            </Button>
            <Button onClick={() => ref.current.onAdd({ isUnshift: false })}>添加到末尾</Button>
          </div>

          <GroupList ref={ref} name="group" defaultLength={1}>
            {({ index, onAdd, onRemove, length }) => {
              return (
                <div
                  key={index}
                  style={{
                    padding: 16,
                    marginBottom: 16,
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    background: '#fafafa'
                  }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 12 }}>
                    联系人 {index + 1} (共 {length} 项)
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Input name="name" label="姓名" rule="REQ LEN-0-10" />
                    <Input name="phone" label="手机号" rule="TEL" />
                    <Input name="email" label="邮箱" rule="EMAIL" />
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>子分组：</div>
                    <GroupList name="inner" defaultLength={0}>
                      {({ index: innerIndex, onRemove: innerRemove, length: innerLength }) => {
                        return (
                          <div
                            key={innerIndex}
                            style={{
                              padding: 12,
                              marginBottom: 8,
                              background: '#e8e8e8',
                              borderRadius: 4
                            }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: 12 }}>子项 {innerIndex + 1}</span>
                              <Input name="detail" label="详情" rule="LEN-0-20" />
                              <Button size="small" danger onClick={innerRemove}>
                                删除
                              </Button>
                            </div>
                          </div>
                        );
                      }}
                    </GroupList>
                    <div style={{ marginTop: 8 }}>
                      <Button size="small" onClick={() => onAdd()}>
                        添加子项
                      </Button>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <Button danger size="small" onClick={onRemove}>
                      删除联系人 {index + 1}
                    </Button>
                  </div>
                </div>
              );
            }}
          </GroupList>

          <div style={{ marginTop: 20 }}>
            <Space>
              <SubmitButton>提交</SubmitButton>
              <ResetButton />
            </Space>
          </div>
        </ReactForm>
      </Card>
    </div>
  );
};

render(<BaseExample />);
