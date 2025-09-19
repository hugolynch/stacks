<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Tile } from '../types/game'

  export let tile: Tile
  export let index: number

  const dispatch = createEventDispatcher()

  let isDragging = false
  let dragStarted = false
  let dragStartX = 0
  let dragStartY = 0
  let dragOffsetX = 0
  let dragOffsetY = 0
  let tileElement: HTMLDivElement

  function handleMouseDown(e: MouseEvent) {
    isDragging = true
    dragStarted = false
    dragStartX = e.clientX
    dragStartY = e.clientY
    
    // Calculate offset from mouse to tile center
    const rect = tileElement.getBoundingClientRect()
    dragOffsetX = e.clientX - rect.left - rect.width / 2
    dragOffsetY = e.clientY - rect.top - rect.height / 2
    
    // Add global mouse events
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    e.preventDefault()
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragStartX
    const deltaY = e.clientY - dragStartY
    
    // Only start dragging if moved more than 5 pixels
    if (!dragStarted && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
      dragStarted = true
      dispatch('dragstart', { index, tile })
    }
    
    // Update tile position during drag
    if (dragStarted) {
      const newX = e.clientX - dragOffsetX
      const newY = e.clientY - dragOffsetY
      
      tileElement.style.position = 'fixed'
      tileElement.style.left = `${newX}px`
      tileElement.style.top = `${newY}px`
      tileElement.style.pointerEvents = 'none'
    }
  }

  function handleMouseEnter() {
    if (dragStarted) {
      dispatch('dragover', { index, tile })
    }
  }

  function handleMouseUp(e: MouseEvent) {
    if (isDragging) {
      if (dragStarted) {
        dispatch('dragend', { index, tile })
      }
      
      // Reset tile position
      tileElement.style.position = ''
      tileElement.style.left = ''
      tileElement.style.top = ''
      tileElement.style.pointerEvents = ''
    }
    
    isDragging = false
    dragStarted = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  function handleClick() {
    if (!isDragging && !dragStarted) {
      dispatch('click', { index, tile })
    }
  }
</script>

<div 
  bind:this={tileElement}
  class="word-tile"
  class:dragging={isDragging}
  on:mousedown={handleMouseDown}
  on:click={handleClick}
  on:mouseenter={handleMouseEnter}
  role="button"
  tabindex="0"
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
>
  {tile.letter}
</div>

<style>
  .word-tile {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #90EE90;
    border: 2px solid #4CAF50;
    border-radius: 4px;
    cursor: grab;
    user-select: none;
    font-weight: bold;
    font-size: 18px;
    transition: all 0.2s ease;
  }

  .word-tile:hover {
    background-color: #7ED321;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .word-tile:active {
    cursor: grabbing;
  }

  .word-tile.dragging {
    opacity: 0.7;
    transform: rotate(5deg) scale(1.1);
    z-index: 1000;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }

  .word-tile:focus {
    outline: 2px solid #007acc;
    outline-offset: 2px;
  }
</style>
