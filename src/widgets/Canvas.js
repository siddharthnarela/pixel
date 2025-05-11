import { View } from 'react-native';
import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { GestureHandlerRootView, PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';

const Pixel = React.memo(({ color, size, showGrid }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderWidth: showGrid ? 0.5 : 0,
        borderColor: 'rgba(0,0,0,0.1)',
      }}
    />
  );
});

const Canvas = forwardRef(({ 
  height = 10, 
  width = 20, 
  drawingColor = '#000000', 
  tool = 'brush',
  brushSize = 1,
  pixelSize = 20,
  onColorPicked
}, ref) => {
  const [grid, setGrid] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [gridVisible, setGridVisible] = useState(true);

  const lastDrawnPixel = useRef({ row: -1, col: -1 });
  const throttleRef = useRef(false);
  const pendingUpdates = useRef([]);
  const floodFillStarted = useRef(false);

  // Initialize grid
  useEffect(() => {
    const initialGrid = Array(height).fill().map(() => Array(width).fill('#FFFFFF'));
    setGrid(initialGrid);
    setHistory([initialGrid]);
    setHistoryIndex(0);
  }, [height, width]);
  
  // Handle history - save current state to history when grid changes
  const saveToHistory = (newGrid) => {
    const currentHistory = history.slice(0, historyIndex + 1);
    const updatedHistory = [...currentHistory, JSON.parse(JSON.stringify(newGrid))];
    
    // Limit history size to avoid memory issues
    if (updatedHistory.length > 30) {
      updatedHistory.shift();
    }
    
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    undo: () => {
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setGrid(JSON.parse(JSON.stringify(history[historyIndex - 1])));
      }
    },
    redo: () => {
      if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setGrid(JSON.parse(JSON.stringify(history[historyIndex + 1])));
      }
    },
    toggleGrid: () => {
      setGridVisible(!gridVisible);
    },
    clear: () => {
      const clearedGrid = Array(height).fill().map(() => Array(width).fill('#FFFFFF'));
      setGrid(clearedGrid);
      saveToHistory(clearedGrid);
    }
  }));

  const applyPendingUpdates = () => {
    if (pendingUpdates.current.length === 0) return;

    setGrid(currentGrid => {
      const newGrid = JSON.parse(JSON.stringify(currentGrid));
      
      pendingUpdates.current.forEach(({ row, col }) => {
        if (row >= 0 && row < height && col >= 0 && col < width) {
          if (tool === 'brush') {
            newGrid[row][col] = drawingColor;
          } else if (tool === 'eraser') {
            newGrid[row][col] = '#FFFFFF';
          }
        }
      });
      
      pendingUpdates.current = [];
      return newGrid;
    });

    throttleRef.current = false;
  };

  const queuePixelUpdate = (row, col) => {
    // For brush sizes larger than 1, affect surrounding pixels too
    if (brushSize > 1) {
      const offset = Math.floor(brushSize / 2);
      
      for (let i = -offset; i <= offset; i++) {
        for (let j = -offset; j <= offset; j++) {
          const newRow = row + i;
          const newCol = col + j;
          
          if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
            // For a circular brush
            if (brushSize <= 2 || Math.sqrt(i*i + j*j) <= offset) {
              pendingUpdates.current.push({ row: newRow, col: newCol });
            }
          }
        }
      }
    } else {
      pendingUpdates.current.push({ row, col });
    }

    if (!throttleRef.current) {
      throttleRef.current = true;
      setTimeout(applyPendingUpdates, 16);
    }
  };

  // Get color at specific position
  const getColorAtPosition = (row, col) => {
    if (row >= 0 && row < height && col >= 0 && col < width) {
      return grid[row][col];
    }
    return null;
  };

  // Eyedropper tool handler
  const handleEyedropper = (row, col) => {
    const color = getColorAtPosition(row, col);
    if (color && onColorPicked) {
      onColorPicked(color);
    }
  };

  // Flood fill algorithm (paint bucket)
  const floodFill = (row, col, targetColor, replacementColor) => {
    if (targetColor === replacementColor) return;
    if (row < 0 || row >= height || col < 0 || col >= width) return;
    if (grid[row][col] !== targetColor) return;
    
    // Create a new grid with the updated color
    const newGrid = JSON.parse(JSON.stringify(grid));
    
    // Queue for BFS
    const queue = [];
    queue.push({ row, col });
    
    // Process queue
    while (queue.length > 0) {
      const current = queue.shift();
      const r = current.row;
      const c = current.col;
      
      if (r < 0 || r >= height || c < 0 || c >= width) continue;
      if (newGrid[r][c] !== targetColor) continue;
      
      newGrid[r][c] = replacementColor;
      
      // Add adjacent cells to queue
      queue.push({ row: r + 1, col: c });
      queue.push({ row: r - 1, col: c });
      queue.push({ row: r, col: c + 1 });
      queue.push({ row: r, col: c - 1 });
    }
    
    setGrid(newGrid);
    saveToHistory(newGrid);
  };

  const onGestureEvent = (event) => {
    const { x, y } = event.nativeEvent;
    
    const row = Math.floor(y / pixelSize);
    const col = Math.floor(x / pixelSize);
    
    // Skip if this pixel was already processed
    if (lastDrawnPixel.current.row === row && lastDrawnPixel.current.col === col) return;
    
    // Eyedropper tool
    if (tool === 'eyedropper') {
      handleEyedropper(row, col);
      return;
    }
    
    // Flood fill tool
    if (tool === 'fill') {
      if (!floodFillStarted.current) {
        floodFillStarted.current = true;
        const targetColor = getColorAtPosition(row, col);
        floodFill(row, col, targetColor, drawingColor);
      }
      return;
    }
    
    // Brush or eraser tools
    lastDrawnPixel.current = { row, col };
    queuePixelUpdate(row, col);

    // Line interpolation for continuous drawing
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

  const handleTapGesture = (event) => {
    const { x, y } = event.nativeEvent;
    const row = Math.floor(y / pixelSize);
    const col = Math.floor(x / pixelSize);
    
    // Eyedropper tool
    if (tool === 'eyedropper') {
      handleEyedropper(row, col);
      return;
    }
    
    // Flood fill tool
    if (tool === 'fill') {
      const targetColor = getColorAtPosition(row, col);
      floodFill(row, col, targetColor, drawingColor);
      return;
    }
    
    // Single tap for brush/eraser
    queuePixelUpdate(row, col);
    applyPendingUpdates();
  };

  return (
    <GestureHandlerRootView>
      <TapGestureHandler
        onHandlerStateChange={(event) => {
          if (event.nativeEvent.state === State.ACTIVE) {
            handleTapGesture(event);
          }
        }}
      >
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.BEGAN) {
              lastDrawnPixel.current = { row: -1, col: -1 };
              floodFillStarted.current = false;
              onGestureEvent(event);
            } else if (event.nativeEvent.state === State.END) {
              applyPendingUpdates();
              // Save to history after drawing is complete
              setTimeout(() => {
                setGrid(currentGrid => {
                  saveToHistory(currentGrid);
                  return currentGrid;
                });
              }, 50);
            }
          }}
          minDist={0}
          avgTouches
        >
          <View style={{ overflow: 'hidden' }}>
            <View style={{ display: 'flex', flexDirection: 'column', margin: 0, fontSize: 0 }}>
              {grid.map((row, rowIndex) => (
                <View key={rowIndex} style={{ flexDirection: 'row', margin: 0, padding: 0, fontSize: 0 }}>
                  {row.map((cellColor, colIndex) => (
                    <Pixel 
                      key={colIndex} 
                      color={cellColor} 
                      size={pixelSize} 
                      showGrid={gridVisible} 
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </PanGestureHandler>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
});

export default Canvas;