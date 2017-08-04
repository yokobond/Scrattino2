/**
 * Created by ky on 2016/11/25.
 */

export const PORT_LIST_CHANGED = 'PORT_LIST_CHANGED';
export const PORT_LIST_SELECT = 'PORT_LIST_SELECT';

export function portListChanged(ports) {
  return {
    type: PORT_LIST_CHANGED,
    ports: ports,
  };
}

export function portListSelect(portPath) {
  return {
    type: PORT_LIST_SELECT,
    selectedPort: portPath,
  };
}
