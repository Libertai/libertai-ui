import { boot } from 'quasar/wrappers';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

export default boot(() => {
  dayjs.extend(localizedFormat);
  dayjs.extend(relativeTime);
});
