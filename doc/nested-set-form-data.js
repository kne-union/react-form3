/**
 * 验证：外层 GroupList + 内层 GroupList，一次 setFormData 后
 * 每条外层项的内层列表都应有数据（修复：setFormData 同步更新 initFormData）。
 *
 * 操作：点「一次 setFormData」→ 三条技能下依据均应有内容；再「读取 getFormData」对照。
 */
const { default: ReactForm, useField, useSubmit, useReset, useFormApi, GroupList } = _ReactForm;
const { useRef, useState } = React;
const { Button, Space, Card, Input: AntInput, Typography, message, Alert, Divider } = antd;
const { Text, Paragraph } = Typography;

const SAMPLE_DATA = {
  skill: [
    {
      name: '技能 A',
      contentItems: [
        { title: '依据 A1', description: '描述 A1', source: 'JD' },
        { title: '依据 A2', description: '描述 A2', source: '报告' }
      ]
    },
    {
      name: '技能 B',
      contentItems: [
        { title: '依据 B1', description: '描述 B1', source: 'JD' },
        { title: '依据 B2', description: '描述 B2', source: '报告' }
      ]
    },
    {
      name: '技能 C',
      contentItems: [
        { title: '依据 C1', description: '描述 C1', source: 'JD' },
        { title: '依据 C2', description: '描述 C2', source: '报告' }
      ]
    }
  ]
};

const Input = props => {
  const fieldProps = useField(props);
  const isError = fieldProps.errState === 2;
  return (
    <div style={{ marginBottom: 8, minWidth: 140 }}>
      <div style={{ marginBottom: 4 }}>
        <Text type={isError ? 'danger' : undefined} style={{ fontSize: 12 }}>
          {fieldProps.label}
        </Text>
      </div>
      <AntInput
        ref={fieldProps.fieldRef}
        value={fieldProps.value ?? ''}
        onChange={e => fieldProps.onChange(e.target.value)}
        onBlur={fieldProps.triggerValidate}
        status={isError ? 'error' : undefined}
        size="small"
      />
    </div>
  );
};

const ContentItems = () => {
  const ref = useRef(null);
  return (
    <div style={{ marginTop: 8, padding: 8, background: '#f0f5ff', borderRadius: 4 }}>
      <Text strong style={{ fontSize: 12 }}>
        依据（内层 GroupList / contentItems）
      </Text>
      <GroupList ref={ref} name="contentItems" defaultLength={0} reverseOrder={false}>
        {({ index, onRemove }) => (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'flex-end',
              marginTop: 8,
              padding: 8,
              background: '#fff',
              borderRadius: 4,
              border: '1px dashed #91caff'
            }}>
            <Text style={{ fontSize: 12 }}>依据 {index + 1}</Text>
            <Input name="title" label="标题" />
            <Input name="description" label="描述" />
            <Input name="source" label="来源" />
            <Button size="small" danger onClick={onRemove}>
              删
            </Button>
          </div>
        )}
      </GroupList>
      <Button size="small" style={{ marginTop: 8 }} onClick={() => ref.current?.onAdd()}>
        添加依据
      </Button>
    </div>
  );
};

const SnapshotPanel = () => {
  const { openApi } = useFormApi();
  const [snap, setSnap] = useState(null);
  return (
    <div style={{ marginTop: 12 }}>
      <Button
        onClick={() => {
          const data = openApi.getFormData();
          setSnap(data);
          console.log('[nested-set-form-data] getFormData', data);
          const summary = (data.skill || []).map((s, i) => ({
            index: i,
            name: s?.name,
            contentItemsLen: Array.isArray(s?.contentItems) ? s.contentItems.length : 0,
            contentItems: s?.contentItems
          }));
          console.log('[nested-set-form-data] contentItems summary', summary);
          message.info('已打印 getFormData，见控制台');
        }}>
        读取 getFormData
      </Button>
      {snap ? (
        <pre style={{ marginTop: 8, fontSize: 11, maxHeight: 240, overflow: 'auto', background: '#fafafa', padding: 8 }}>
          {JSON.stringify(snap, null, 2)}
        </pre>
      ) : null}
    </div>
  );
};

const Toolbar = () => {
  const { openApi } = useFormApi();
  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <Button
        type="primary"
        onClick={() => {
          console.log('[nested-set-form-data] setFormData once', SAMPLE_DATA);
          openApi.setFormData(SAMPLE_DATA, false);
        }}>
        一次 setFormData（模拟 AI 填充）
      </Button>
      <Button
        onClick={() => {
          openApi.setFormData({ skill: [{ name: '', contentItems: [] }] }, false);
        }}>
        重置为 1 条空技能
      </Button>
    </Space>
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

const BaseExample = () => {
  const skillRef = useRef();
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="嵌套 GroupList + setFormData 复现" bordered={false}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="验收点"
          description={
            <Paragraph style={{ marginBottom: 0 }}>
              初始 1 条外层技能（defaultLength=1），内层依据 defaultLength=0。一次 setFormData 写入 3 条技能、每条 2 条依据后，<strong>三条技能的依据都应有内容</strong>（依赖 setFormData 同步更新 initFormData）。
            </Paragraph>
          }
        />
        <ReactForm
          onSubmit={data => {
            console.log('submit', data);
            message.success('已提交，见控制台');
          }}>
          <Toolbar />
          <div style={{ marginBottom: 12 }}>
            <Button type="dashed" onClick={() => skillRef.current?.onAdd()}>
              手动添加技能
            </Button>
          </div>
          <GroupList ref={skillRef} name="skill" defaultLength={1} reverseOrder={false}>
            {({ index, onRemove, length }) => (
              <div
                style={{
                  padding: 16,
                  marginBottom: 12,
                  border: '1px solid #d9d9d9',
                  borderRadius: 8,
                  background: '#fff'
                }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  技能 {index + 1} / 共 {length}
                </div>
                <Input name="name" label="技能名称" rule="REQ" />
                <ContentItems />
                <Button danger size="small" style={{ marginTop: 8 }} onClick={onRemove}>
                  删除技能
                </Button>
              </div>
            )}
          </GroupList>
          <Divider />
          <SnapshotPanel />
          <Space style={{ marginTop: 16 }}>
            <SubmitButton>提交</SubmitButton>
            <ResetButton />
          </Space>
        </ReactForm>
      </Card>
    </div>
  );
};

render(<BaseExample />);
