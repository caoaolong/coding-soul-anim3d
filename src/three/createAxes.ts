import {
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';

export interface AxesOptions {
  /** 轴长度（原点到箭头尖端） */
  length?: number;
  /** 轴半径 */
  radius?: number;
}

export interface OrthogonalGridsOptions {
  /** 网格覆盖范围（从原点沿正半轴） */
  size?: number;
  /** 每个方向的格子数 */
  divisions?: number;
  /** 普通网格线颜色 */
  color?: number | string;
  /** 与坐标轴重合的边线颜色（更醒目） */
  edgeColor?: number | string;
}

export interface CoordinateFrameOptions extends AxesOptions, OrthogonalGridsOptions {}

/**
 * 创建右手坐标系 3D 坐标轴：X 红、Y 绿、Z 蓝。
 */
export function createAxes({
  length = 5,
  radius = 0.012,
}: AxesOptions = {}): Group {
  const axes = new Group();
  axes.name = 'Axes';

  axes.add(makeAxis(new Vector3(1, 0, 0), 0xef4444, length, radius)); // X
  axes.add(makeAxis(new Vector3(0, 1, 0), 0x22c55e, length, radius)); // Y
  axes.add(makeAxis(new Vector3(0, 0, 1), 0x3b82f6, length, radius)); // Z

  return axes;
}

/**
 * 在三个正交平面的正半区绘制网格墙：XY(z=0)、XZ(y=0)、YZ(x=0)。
 * 适合后续叠加 3D 图表演示。
 */
export function createOrthogonalGrids({
  size = 5,
  divisions = 10,
  color = 0x334155,
  edgeColor = 0x64748b,
}: OrthogonalGridsOptions = {}): Group {
  const grids = new Group();
  grids.name = 'OrthogonalGrids';

  const gridColor = new Color(color);
  const majorColor = new Color(edgeColor);

  // 底面 XZ（y = 0）
  grids.add(makePlaneGrid('xz', size, divisions, gridColor, majorColor));
  // 背面 XY（z = 0）
  grids.add(makePlaneGrid('xy', size, divisions, gridColor, majorColor));
  // 侧面 YZ（x = 0）
  grids.add(makePlaneGrid('yz', size, divisions, gridColor, majorColor));

  return grids;
}

/**
 * 坐标轴 + 正交网格，一站式坐标系。
 */
export function createCoordinateFrame({
  length = 5,
  radius = 0.012,
  size = length,
  divisions = 10,
  color = 0x334155,
  edgeColor = 0x64748b,
}: CoordinateFrameOptions = {}): Group {
  const frame = new Group();
  frame.name = 'CoordinateFrame';
  frame.add(createOrthogonalGrids({size, divisions, color, edgeColor}));
  frame.add(createAxes({length, radius}));
  return frame;
}

function makeAxis(
  direction: Vector3,
  color: number,
  length: number,
  radius: number,
): Group {
  const group = new Group();
  const material = new MeshStandardMaterial({
    color,
    metalness: 0.15,
    roughness: 0.45,
  });

  const coneHeight = Math.min(length * 0.08, 0.28);
  const shaftLength = length - coneHeight;

  const shaft = new Mesh(
    new CylinderGeometry(radius, radius, shaftLength, 16),
    material,
  );
  // Cylinder 默认沿 Y，先摆到 +Y，再整体对准目标方向
  shaft.position.y = shaftLength / 2;

  const cone = new Mesh(
    new ConeGeometry(radius * 2.8, coneHeight, 16),
    material,
  );
  cone.position.y = shaftLength + coneHeight / 2;

  group.add(shaft, cone);
  group.quaternion.setFromUnitVectors(
    new Vector3(0, 1, 0),
    direction.clone().normalize(),
  );

  return group;
}

type PlaneKind = 'xy' | 'xz' | 'yz';

function makePlaneGrid(
  plane: PlaneKind,
  size: number,
  divisions: number,
  color: Color,
  edgeColor: Color,
): LineSegments {
  const step = size / divisions;
  const positions: number[] = [];
  const colors: number[] = [];

  const pushLine = (
    a: Vector3,
    b: Vector3,
    lineColor: Color,
  ) => {
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    colors.push(
      lineColor.r,
      lineColor.g,
      lineColor.b,
      lineColor.r,
      lineColor.g,
      lineColor.b,
    );
  };

  for (let i = 0; i <= divisions; i++) {
    const t = i * step;
    const isEdge = i === 0 || i === divisions;
    const lineColor = isEdge ? edgeColor : color;

    if (plane === 'xz') {
      // 平行于 X 的线（沿 Z 变化固定）与平行于 Z 的线
      pushLine(new Vector3(0, 0, t), new Vector3(size, 0, t), lineColor);
      pushLine(new Vector3(t, 0, 0), new Vector3(t, 0, size), lineColor);
    } else if (plane === 'xy') {
      pushLine(new Vector3(0, t, 0), new Vector3(size, t, 0), lineColor);
      pushLine(new Vector3(t, 0, 0), new Vector3(t, size, 0), lineColor);
    } else {
      // yz
      pushLine(new Vector3(0, 0, t), new Vector3(0, size, t), lineColor);
      pushLine(new Vector3(0, t, 0), new Vector3(0, t, size), lineColor);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

  const material = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
  });

  const lines = new LineSegments(geometry, material);
  lines.name = `Grid_${plane.toUpperCase()}`;
  return lines;
}
