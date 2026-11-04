const { default: ReactForm, useField, useFormApi } = _ReactForm;
const { useState, useEffect, Profiler } = React;
const { Button, Space, Card, Input: AntInput, Segmented, Radio, Statistic, Row, Col, Alert, Typography, Divider } = antd;
const { Text, Paragraph } = Typography;

// ========================================
// 渲染统计：字段组件在渲染阶段累加计数，Profiler 在 commit 阶段累加耗时
// ========================================

const stats = {
  fieldRenders: 0,
  mountDuration: 0,
  inputStartRenders: 0,
  inputCommits: 0,
  inputDuration: 0,
  measuring: false,
  listener: null,
  notify(patch) {
    this.listener && this.listener(patch);
  }
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 12,
  maxHeight: 480,
  overflow: 'auto',
  padding: 4
};

const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 };

const SECTIONS = ['客户信息', '联系人', '开票信息', '收货地址', '合同条款', '备注'];

const createFieldList = count =>
  Array.from({ length: count }, (_, index) => ({
    name: `item_${index + 1}`,
    label: `${SECTIONS[index % SECTIONS.length]}-${Math.floor(index / SECTIONS.length) + 1}`
  }));

// ========================================
// 反例写法：字段内读取 formData 派生内容，每次输入都立即校验
// ========================================

const BadInput = props => {
  stats.fieldRenders++;
  const fieldProps = useField(props);
  const filledCount = Object.values(fieldProps.formData || {}).filter(value => value !== undefined && value !== '').length;
  const isError = fieldProps.errState === 2;

  return (
    <div style={fieldStyle}>
      <Text type={isError ? 'danger' : undefined} ellipsis>
        {fieldProps.label}
        <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
          (已填 {filledCount})
        </Text>
      </Text>
      <AntInput
        ref={fieldProps.fieldRef}
        size="small"
        value={fieldProps.value ?? ''}
        status={isError ? 'error' : undefined}
        onChange={e => {
          fieldProps.onChange(e.target.value);
          fieldProps.triggerValidate();
        }}
      />
    </div>
  );
};

// ========================================
// 推荐写法：字段只关心自身值，校验加 debounce，整表数据按需读取
// ========================================

const GoodInput = props => {
  stats.fieldRenders++;
  const fieldProps = useField(Object.assign({ debounce: 300 }, props));
  const isError = fieldProps.errState === 2;

  return (
    <div style={fieldStyle}>
      <Text type={isError ? 'danger' : undefined} ellipsis>
        {fieldProps.label}
      </Text>
      <AntInput
        ref={fieldProps.fieldRef}
        size="small"
        value={fieldProps.value ?? ''}
        status={isError ? 'error' : undefined}
        onChange={e => {
          fieldProps.onChange(e.target.value);
          fieldProps.triggerValidate();
        }}
        onBlur={fieldProps.triggerValidate}
      />
    </div>
  );
};

const FormDataSummary = () => {
  const { openApi } = useFormApi();
  const [summary, setSummary] = useState(null);

  return (
    <Space style={{ marginBottom: 12 }}>
      <Button
        size="small"
        onClick={() => {
          const formData = openApi.getFormData();
          setSummary(Object.values(formData).filter(value => value !== undefined && value !== '').length);
        }}
      >
        按需读取表单数据
      </Button>
      {summary !== null && <Text type="secondary">已填写 {summary} 个字段</Text>}
    </Space>
  );
};

// ========================================
// 统计面板：独立持有 state，刷新统计时不会让表单重渲染而污染计数
// ========================================

const StatsPanel = () => {
  const [state, setState] = useState({ mountDuration: 0, lastInput: null, totalRenders: 0 });

  useEffect(() => {
    stats.listener = patch => setState(current => Object.assign({}, current, patch));
    stats.notify({ mountDuration: stats.mountDuration, totalRenders: stats.fieldRenders });
    return () => {
      stats.listener = null;
    };
  }, []);

  const { mountDuration, lastInput, totalRenders } = state;

  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={6}>
        <Statistic title="挂载 commit 耗时 (ms)" value={mountDuration} precision={1} />
      </Col>
      <Col span={6}>
        <Statistic title="最近一次输入的字段渲染次数" value={lastInput ? lastInput.renders : '-'} />
      </Col>
      <Col span={6}>
        <Statistic title="最近一次输入的 commit 耗时 (ms)" value={lastInput ? lastInput.duration : '-'} precision={1} suffix={lastInput ? `/ ${lastInput.commits} 次 commit` : ''} />
      </Col>
      <Col span={6}>
        <Statistic title="累计字段渲染次数" value={totalRenders} />
      </Col>
    </Row>
  );
};

const resetStats = () => {
  clearTimeout(stats.settleTimer);
  stats.fieldRenders = 0;
  stats.measuring = false;
  stats.notify({ lastInput: null, totalRenders: 0 });
};

const startMeasure = () => {
  if (stats.measuring) {
    return;
  }
  stats.measuring = true;
  stats.inputStartRenders = stats.fieldRenders;
  stats.inputCommits = 0;
  stats.inputDuration = 0;
};

const flushInputStats = () => {
  stats.measuring = false;
  stats.notify({
    lastInput: {
      renders: stats.fieldRenders - stats.inputStartRenders,
      commits: stats.inputCommits,
      duration: stats.inputDuration
    },
    totalRenders: stats.fieldRenders
  });
};

const onProfilerRender = (id, phase, actualDuration) => {
  if (phase === 'mount') {
    stats.mountDuration = actualDuration;
    stats.notify({ mountDuration: actualDuration, totalRenders: stats.fieldRenders });
    return;
  }
  if (!stats.measuring) {
    return;
  }
  stats.inputCommits++;
  stats.inputDuration += actualDuration;
  clearTimeout(stats.settleTimer);
  stats.settleTimer = setTimeout(flushInputStats, 100);
};

// ========================================
// 压测面板
// ========================================

const PerfExample = () => {
  const [count, setCount] = useState(100);
  const [mode, setMode] = useState('bad');

  const fieldList = createFieldList(count);
  const FieldComponent = mode === 'bad' ? BadInput : GoodInput;

  return (
    <Card title="大表单性能压测">
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="当前版本特性：任一字段输入都会让表单内所有字段重渲染"
        description={
          <div>
            <Paragraph style={{ marginBottom: 4 }}>
              字段状态集中存放在 Form 的 formState 中并通过 context 下发，单个字段变化会生成新的 formState，所有 useField 消费者在同一次 commit 中重渲染，且每个字段渲染时都会重新计算一次整表 formData。字段数为 n 时，一次输入的字段渲染次数是
              n 的整数倍（每个 commit 都会渲染全部字段）。
            </Paragraph>
            <Paragraph style={{ marginBottom: 0 }}>
              使用侧建议：字段内不要依赖 formData 渲染，需要整表数据时用 useFormApi().openApi.getFormData() 按需读取；校验设置 debounce；GroupList 项数较多时分页或虚拟滚动；noFilter 非必要不开启。
            </Paragraph>
          </div>
        }
      />

      <Space wrap size="large" style={{ marginBottom: 16 }}>
        <Space>
          <Text>字段数</Text>
          <Segmented
            value={count}
            options={[50, 100, 200, 400]}
            onChange={value => {
              resetStats();
              setCount(value);
            }}
          />
        </Space>
        <Space>
          <Text>写法</Text>
          <Radio.Group
            value={mode}
            optionType="button"
            onChange={e => {
              resetStats();
              setMode(e.target.value);
            }}
            options={[
              { label: '反例：字段读 formData + 每键校验', value: 'bad' },
              { label: '推荐：按需读取 + debounce 校验', value: 'good' }
            ]}
          />
        </Space>
        <Button onClick={resetStats}>清零统计</Button>
      </Space>

      <StatsPanel />

      <Text type="secondary">在任意输入框中键入一个字符，停顿后统计会刷新。推荐写法的渲染次数仍与字段数成正比（库层面的 context 分发所致），但省去了字段内派生计算和逐键校验。</Text>
      <Divider style={{ margin: '12px 0' }} />

      <Profiler key={`${count}-${mode}`} id="perf-form" onRender={onProfilerRender}>
        <ReactForm>
          {mode === 'good' && <FormDataSummary />}
          <div style={gridStyle} onInputCapture={startMeasure}>
            {fieldList.map(({ name, label }) => (
              <FieldComponent key={name} name={name} label={label} rule="REQ" />
            ))}
          </div>
        </ReactForm>
      </Profiler>
    </Card>
  );
};

render(<PerfExample />);
