const classMap = {
  header: 'hui-grid-header',
  body: 'hui-grid-body',
  nodata: 'hui-grid-nodata',
  table: 'hui-grid-table',
  scrollWrapper: 'hui-grid-scroll-wrapper',
  scrollContainer: 'hui-grid-scroll-container',
  scrollContent: 'hui-grid-scroll-content',
  scrollbar: 'hui-scrollbar',
  row: 'hui-grid-row',
  headerRow: 'hui-grid-header-row',
  dataRow: 'hui-grid-data-row',
  groupRow: 'hui-grid-group-row',
};

export type ClassMapKey = keyof typeof classMap;

type CNParam = [ClassMapKey] | [string, ClassMapKey] | [string, ClassMapKey, string];

const cn = (...args: CNParam) => {
  switch (args.length) {
    case 1:
      return classMap[args[0]];
    case 2:
    case 3:
      const [prefix, target, sufix = ''] = args;
      return prefix + classMap[target] + sufix;
  }
};
const cns = (...targets: ClassMapKey[]) => targets.map((item) => classMap[item]);

export { cn, cns };
