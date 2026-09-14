const { default: ReactForm, useField, useSubmit, useReset, useFormApi, GroupList } = _ReactForm;
const { useEffect, useRef, useState } = React;
const { Button, Space, Card, Input: AntInput, Select: AntSelect, Tag, Typography, message, Alert } = antd;
const { Text } = Typography;

const Input = props => {
  const fieldProps = useField(props);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ marginBottom: 4 }}>
        <Text>{fieldProps.label}</Text>
      </div>
      <AntInput
        {...fieldProps.associationOptions}
        value={fieldProps.value || ''}
        onChange={e => fieldProps.onChange(e.target.value)}
        onBlur={fieldProps.triggerValidate}
        style={{ width: 220 }}
      />
    </div>
  );
};

const SubmitButton = ({ children }) => {
  const { isLoading, onClick } = useSubmit();
  return (
    <Button type="primary" onClick={onClick} loading={isLoading}>
      {children}
    </Button>
  );
};

const ResetButton = () => {
  const { onClick } = useReset();
  return <Button onClick={onClick}>重置</Button>;
};

const FormDataPreview = () => {
  const { openApi, emitter } = useFormApi();
  const [json, setJson] = useState(() => JSON.stringify(openApi.getFormData() || {}, null, 2));
  useEffect(() => {
    const sync = () => setJson(JSON.stringify(openApi.getFormData() || {}, null, 2));
    const token = emitter.addListener('form:field:set-value', sync);
    return () => token.remove();
  }, [emitter, openApi]);
  return (
    <pre style={{ margin: 0, padding: 12, background: '#fafafa', borderRadius: 6, fontSize: 12 }}>{json}</pre>
  );
};

const ReadyProbe = () => {
  const { openApi } = useFormApi();
  const [text, setText] = useState('尚未调用 onReady');
  return (
    <Space>
      <Button
        onClick={() => {
          openApi.onReady(() => setText('已挂载，onReady 立即执行'));
        }}>
        挂载后再点 onReady
      </Button>
      <Text>{text}</Text>
    </Space>
  );
};

const DataRefCard = () => {
  const [, setTick] = useState(0);
  const [showExtra, setShowExtra] = useState(false);
  const formRef = useRef(null);
  const data = { extra: '来自 props' };
  return (
    <Card
      type="inner"
      title={
        <Space>
          4. data 仅引用变化不冲 init<Tag color="blue">晚挂载字段</Tag>
        </Space>
      }
      style={{ marginBottom: 16 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        父组件每次点「重渲染」都会传入新的 data 对象，内容仍是「来自 props」。先 setFormData 再 forget pending，重渲染后显示晚挂载字段，应仍是 setFormData 的值。
      </Text>
      <ReactForm ref={formRef} data={data}>
        <Space wrap style={{ marginBottom: 12 }}>
          <Button onClick={() => formRef.current.setFormData({ extra: '来自 setFormData' })}>setFormData</Button>
          <Button onClick={() => formRef.current.forgetField({ name: 'extra' })}>forget pending</Button>
          <Button onClick={() => setTick(x => x + 1)}>父组件重渲染</Button>
          <Button type="primary" onClick={() => setShowExtra(true)}>
            显示晚挂载字段
          </Button>
        </Space>
        {showExtra ? <Input name="extra" label="extra（晚挂载）" /> : <Alert type="info" message="字段尚未挂载" />}
      </ReactForm>
    </Card>
  );
};

const DefaultLengthCard = () => {
  const formRef = useRef(null);
  const listRef = useRef(null);
  return (
    <Card
      type="inner"
      title={
        <Space>
          5. defaultLength 不垫短数组<Tag color="green">1 条不被垫成 2 条</Tag>
        </Space>
      }
      style={{ marginBottom: 16 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        GroupList defaultLength=2，点按钮写入 1 条数据后应只显示 1 项。
      </Text>
      <ReactForm ref={formRef}>
        <Button
          style={{ marginBottom: 12 }}
          onClick={() => formRef.current.setFormData({ users: [{ name: '仅一条' }] })}>
          setFormData 1 条
        </Button>
        <GroupList ref={listRef} name="users" defaultLength={2} reverseOrder={false}>
          {({ index, onRemove }) => (
            <Space key={index} style={{ display: 'flex', marginBottom: 8 }}>
              <Tag>项 {index + 1}</Tag>
              <Input name="name" label="名称" />
              <Button size="small" danger onClick={onRemove}>
                删除
              </Button>
            </Space>
          )}
        </GroupList>
      </ReactForm>
    </Card>
  );
};

const PARENT_DATA = { users: [{ name: '张三' }, { name: '李四' }] };

const SpliceCard = () => {
  const listRef = useRef(null);
  const [parentJson, setParentJson] = useState(() => JSON.stringify(PARENT_DATA, null, 2));
  return (
    <Card
      type="inner"
      title={
        <Space>
          6. 增删不改外部 data<Tag color="orange">clone 写回 init</Tag>
        </Space>
      }
      style={{ marginBottom: 16 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        删除第一项后，左侧表单少一行；右侧外部 PARENT_DATA 仍是张三、李四。
      </Text>
      <ReactForm data={PARENT_DATA} onFormDataChange={() => setParentJson(JSON.stringify(PARENT_DATA, null, 2))}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <GroupList ref={listRef} name="users" defaultLength={0} reverseOrder={false}>
              {({ index, onRemove }) => (
                <Space key={index} style={{ display: 'flex', marginBottom: 8 }}>
                  <Tag>项 {index + 1}</Tag>
                  <Input name="name" label="名称" />
                  <Button size="small" danger onClick={onRemove}>
                    删除
                  </Button>
                </Space>
              )}
            </GroupList>
          </div>
          <pre style={{ flex: 1, margin: 0, padding: 12, background: '#fafafa', fontSize: 12 }}>{parentJson}</pre>
        </div>
      </ReactForm>
    </Card>
  );
};

const MemoizeCard = () => {
  const [snapshot, setSnapshot] = useState('{}');
  return (
    <Card
      type="inner"
      title={
        <Space>
          7. getFormData 随输入更新<Tag color="purple">不再 memoize 旧 Map</Tag>
        </Space>
      }
      style={{ marginBottom: 16 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        输入时右侧 JSON 应立刻变化。onFormDataChange 同一轮多次 set-value 会合并成一次。
      </Text>
      <ReactForm
        onFormDataChange={formData => {
          setSnapshot(JSON.stringify(formData, null, 2));
        }}>
        <Input name="title" label="标题" />
        <Input name="count" label="数量" />
        <pre style={{ marginTop: 8, padding: 12, background: '#fafafa', fontSize: 12 }}>{snapshot}</pre>
      </ReactForm>
    </Card>
  );
};

const AssociationsCard = () => {
  const [source, setSource] = useState('name');
  return (
    <Card
      type="inner"
      title={
        <Space>
          9. 动态 associations<Tag>改 fields 后跟随新源</Tag>
        </Space>
      }
      style={{ marginBottom: 16 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        切换「跟随字段」后，改对应源字段，昵称应抄新源，不再跟旧源。
      </Text>
      <ReactForm>
        <Space style={{ marginBottom: 12 }}>
          <Text>跟随</Text>
          <AntSelect
            value={source}
            style={{ width: 160 }}
            onChange={setSource}
            options={[
              { label: '名称', value: 'name' },
              { label: '备注', value: 'remark' }
            ]}
          />
        </Space>
        <Input name="name" label="名称" />
        <Input name="remark" label="备注" />
        <Input
          name="nickname"
          label="昵称"
          associations={{
            fields: [{ name: source }],
            callback: ({ target, origin, openApi }) => {
              openApi.setFieldValue(target, origin.value);
            }
          }}
        />
      </ReactForm>
    </Card>
  );
};

const BaseExample = () => {
  const [changeLog, setChangeLog] = useState('尚未变化');
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="修复确认示例" bordered={false}>
        <Card
          type="inner"
          title={
            <Space>
              1 / 2. onFormDataChange 与 onReady<Tag color="cyan">已挂载立即回调</Tag>
            </Space>
          }
          style={{ marginBottom: 16 }}>
          <ReactForm
            onFormDataChange={formData => {
              setChangeLog(JSON.stringify(formData));
            }}
            onSubmit={data => message.success(JSON.stringify(data))}>
            <Input name="name" label="名称" />
            <ReadyProbe />
            <div style={{ margin: '12px 0' }}>
              <Text type="secondary">onFormDataChange：</Text>
              <Text code>{changeLog}</Text>
            </div>
            <FormDataPreview />
            <Space style={{ marginTop: 12 }}>
              <SubmitButton>提交</SubmitButton>
              <ResetButton />
            </Space>
          </ReactForm>
        </Card>

        <DataRefCard />
        <DefaultLengthCard />
        <SpliceCard />
        <MemoizeCard />
        <AssociationsCard />
      </Card>
    </div>
  );
};

render(<BaseExample />);
