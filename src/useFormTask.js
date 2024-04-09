import { useRef, useState } from 'react';

export const FORM_TASK_STATE_ENUM = {
  PENDING: 'PENDING',
  COMPLETE: 'COMPLETE'
};

class Task {
  constructor({ id, runner }) {
    this.id = id;
    this.isCancel = false;
    this.target = Promise.race([
      Promise.resolve(runner()),
      new Promise(resolve => {
        this.resolve = resolve;
      })
    ]);
  }

  cancel(...args) {
    if (this.isCancel) {
      return;
    }

    this.isCancel = true;
    this.resolve(...args);
  }
}

class TaskList {
  constructor({ onChange }) {
    this.list = new Map();
    this.onChange = onChange;
  }

  get isComplete() {
    return this.list.size === 0;
  }

  async append(id, runner) {
    const task = new Task({ id, runner });
    const currentTask = this.list.get(id);
    if (currentTask) {
      currentTask.cancel();
      this.list.delete(id);
    }
    this.list.set(id, task);
    task.target.then(() => {
      this.list.delete(id);
      this.onChange();
    });
    this.onChange();
    return task.target;
  }
}

const useFormTask = () => {
  const [state, setState] = useState(FORM_TASK_STATE_ENUM.COMPLETE);
  const taskRef = useRef(
    new TaskList({
      onChange() {
        setState(this.isComplete ? FORM_TASK_STATE_ENUM.COMPLETE : FORM_TASK_STATE_ENUM.PENDING);
      }
    })
  );
  return {
    state,
    append: (id, runner) => {
      return taskRef.current.append(id, runner);
    },
    get target() {
      return Promise.all(Array.from(taskRef.current.list.values()).map(task => task.target)).then(() => {
        return new Promise(resolve =>
          setTimeout(() => {
            resolve();
          }, 0)
        );
      });
    }
  };
};

export default useFormTask;
