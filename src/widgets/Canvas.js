import { View } from 'react-native';
import React, { useState, useRef, useMemo, memo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';


const Pixel = memo(({ color }) => {
  return (
    <View
      style={{
        width: 20,
        height: 20,
        backgroundColor: color,
      }}
    />
  );
});

export default function Canvas({ height = 10, width = 20 }) {
  const [grid, setGrid] = useState(
    Array(height).fill().map(() => Array(width).fill('white'))
  );
  const [drawingColor, setDrawingColor] = useState('black');

  const lastDrawnPixel = useRef({ row: -1, col: -1 });

  const throttleRef = useRef(false);
  const pendingUpdates = useRef([]);

  const applyPendingUpdates = () => {
    if (pendingUpdates.current.length === 0) return;

    setGrid(currentGrid => {
      const newGrid = [...currentGrid];
      pendingUpdates.current.forEach(({ row, col }) => {
        if (row >= 0 && row < height && col >= 0 && col < width) {
          if (!newGrid[row]) newGrid[row] = [...currentGrid[row]];
          else if (newGrid[row] === currentGrid[row]) newGrid[row] = [...newGrid[row]];
          newGrid[row][col] = drawingColor;
        }
      });
      pendingUpdates.current = [];
      return newGrid;
    });

    throttleRef.current = false;
  };

  const queuePixelUpdate = (row, col) => {
    if (lastDrawnPixel.current.row === row && lastDrawnPixel.current.col === col) return;
    lastDrawnPixel.current = { row, col };
    pendingUpdates.current.push({ row, col });

    if (!throttleRef.current) {
      throttleRef.current = true;
      setTimeout(applyPendingUpdates, 16);
    }
  };

  const onGestureEvent = (event) => {
    const { x, y } = event.nativeEvent;
    const cellSize = 20;

    const row = Math.floor(y / cellSize);
    const col = Math.floor(x / cellSize);

    queuePixelUpdate(row, col);

    if (lastDrawnPixel.current.row !== -1) {
      const { row: lastRow, col: lastCol } = lastDrawnPixel.current;
      if (Math.abs(row - lastRow) > 1 || Math.abs(col - lastCol) > 1) {
        const points = getLinePoints(lastRow, lastCol, row, col);
        points.forEach(point => queuePixelUpdate(point.row, point.col));
      }
    }
  };

  const getLinePoints = (x0, y0, x1, y1) => {
    const points = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      points.push({ row: x0, col: y0 });
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        if (x0 === x1) break;
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        if (y0 === y1) break;
        err += dx;
        y0 += sy;
      }
    }

    return points;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.BEGAN) {
              lastDrawnPixel.current = { row: -1, col: -1 };
              onGestureEvent(event);
            } else if (event.nativeEvent.state === State.END) {
              applyPendingUpdates();
            }
          }}
          minDist={0}
          avgTouches
        >
          <View style={{ flex: 1 }}>
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} style={{ flexDirection: 'row' }}>
                {row.map((cellColor, colIndex) => (
                  <Pixel key={colIndex} color={cellColor} />
                ))}
              </View>
            ))}
          </View>
        </PanGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
