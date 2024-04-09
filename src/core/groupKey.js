const groupKey = (groupId, groupName) => {
  return `${groupId || 'root'}@${groupName}`;
};

export default groupKey;
