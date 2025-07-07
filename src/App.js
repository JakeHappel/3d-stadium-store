import React, { useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Box, Sphere, Cylinder } from "@react-three/drei";
import { ShoppingCart, Navigation, Package, MapPin } from "lucide-react";
import * as THREE from "three";

// Camera positions for different areas
const cameraPositions = {
  stadium: { position: [0, 8, 15], target: [0, 0, 0] },
  locker: { position: [-20, 5, 0], target: [-20, 0, -5] },
  golf: { position: [20, 5, 0], target: [20, 0, -5] },
};

// Product data with 3D positions
const products = {
  stadium: [
    { id: 1, name: "Stadium T-Shirt", price: 35, position: [3, 2, 8] },
    { id: 2, name: "Team Cap", price: 25, position: [5, 2, 8] },
  ],
  locker: [
    { id: 3, name: "Basketball Jersey", price: 89, position: [-18, 2, -2] },
    { id: 4, name: "Athletic Shorts", price: 45, position: [-22, 2, -2] },
    { id: 5, name: "High-Top Sneakers", price: 150, position: [-20, 2, -8] },
  ],
  golf: [
    { id: 6, name: "Golf Driver", price: 299, position: [18, 2, -2] },
    { id: 7, name: "Golf Balls Set", price: 25, position: [22, 2, -2] },
    { id: 8, name: "Golf Glove", price: 35, position: [20, 2, -8] },
  ],
};

// Teleport hotspot component
function TeleportHotspot({
  position,
  label,
  targetLocation,
  onTeleport,
  color = "#ff6b6b",
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group position={position}>
      <Cylinder
        ref={meshRef}
        args={[1, 1, 0.3, 8]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onTeleport(targetLocation)}
      >
        <meshStandardMaterial
          color={hovered ? "#ffffff" : color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transparent
          opacity={0.9}
        />
      </Cylinder>
      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

// Animated product display
function Product({ product, onAddToCart }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.position.y =
        product.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={product.position}>
      <Box
        ref={meshRef}
        args={[0.8, 0.8, 0.8]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onAddToCart(product)}
      >
        <meshStandardMaterial
          color={hovered ? "#ff6b6b" : "#4ecdc4"}
          emissive={hovered ? "#ff3333" : "#2c3e50"}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </Box>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {product.name}
      </Text>
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.25}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        ${product.price}
      </Text>
    </group>
  );
}

// Camera controller component
function CameraController({
  targetPosition,
  targetLookAt,
  isAnimating,
  onAnimationComplete,
}) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useFrame(() => {
    if (isAnimating && targetPosition && targetLookAt) {
      // Smoothly animate camera to target position
      camera.position.lerp(new THREE.Vector3(...targetPosition), 0.05);

      // Update controls target
      if (controlsRef.current) {
        controlsRef.current.target.lerp(
          new THREE.Vector3(...targetLookAt),
          0.05
        );
        controlsRef.current.update();
      }

      // Check if animation is complete
      const distance = camera.position.distanceTo(
        new THREE.Vector3(...targetPosition)
      );
      if (distance < 0.5) {
        onAnimationComplete();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      maxPolarAngle={Math.PI / 2}
      minDistance={2}
      maxDistance={30}
      enableDamping={true}
      dampingFactor={0.05}
    />
  );
}

// Main 3D scene component
function Scene3D({ currentArea, onAddToCart, onTeleport }) {
  // Your 3D models will be loaded here
  // For now, I'll create placeholder geometry representing your stadium areas

  return (
    <>
      {/* Stadium Area - Main court */}
      <group>
        {/* Stadium floor */}
        <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Basketball court */}
        <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[15, 8]} />
          <meshStandardMaterial color="#DEB887" />
        </mesh>

        {/* Stadium walls */}
        <mesh position={[0, 5, -20]}>
          <planeGeometry args={[40, 10]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[20, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[40, 10]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[-20, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[40, 10]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>

      {/* Locker Room Area */}
      <group>
        {/* Locker room floor */}
        <mesh position={[-20, -1, -5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[15, 15]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>

        {/* Lockers */}
        {[-4, -2, 0, 2, 4].map((offset, i) => (
          <mesh key={i} position={[-20 + offset, 1, -12]}>
            <boxGeometry args={[1.5, 4, 1]} />
            <meshStandardMaterial color="#7f8c8d" />
          </mesh>
        ))}

        {/* Locker room walls */}
        <mesh position={[-20, 3, -12]}>
          <planeGeometry args={[15, 6]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>

      {/* Golf Sim Area */}
      <group>
        {/* Golf sim floor */}
        <mesh position={[20, -1, -5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[15, 15]} />
          <meshStandardMaterial color="#2d5016" />
        </mesh>

        {/* Golf simulator screen */}
        <mesh position={[20, 3, -12]}>
          <planeGeometry args={[8, 4]} />
          <meshStandardMaterial
            color="#87ceeb"
            emissive="#87ceeb"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Golf tee area */}
        <mesh position={[20, -0.9, 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[3, 3, 0.1]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      </group>

      {/* Teleport Hotspots */}
      <TeleportHotspot
        position={[-10, 1, -8]}
        label="LOCKER ROOM"
        targetLocation="locker"
        onTeleport={onTeleport}
        color="#e74c3c"
      />
      <TeleportHotspot
        position={[10, 1, -8]}
        label="GOLF SIM"
        targetLocation="golf"
        onTeleport={onTeleport}
        color="#27ae60"
      />
      <TeleportHotspot
        position={[-15, 1, 2]}
        label="MAIN STADIUM"
        targetLocation="stadium"
        onTeleport={onTeleport}
        color="#3498db"
      />
      <TeleportHotspot
        position={[15, 1, 2]}
        label="MAIN STADIUM"
        targetLocation="stadium"
        onTeleport={onTeleport}
        color="#3498db"
      />

      {/* Products for all areas */}
      {Object.entries(products).map(([area, areaProducts]) =>
        areaProducts.map((product) => (
          <Product
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))
      )}

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, 10]} intensity={0.5} />
      <pointLight position={[0, 10, -10]} intensity={0.5} />
      <pointLight position={[-20, 8, -5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[20, 8, -5]} intensity={0.8} color="#ffffff" />

      {/* Stadium lights */}
      <Sphere args={[0.5]} position={[-10, 8, -10]}>
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Sphere args={[0.5]} position={[10, 8, -10]}>
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Sphere args={[0.5]} position={[-10, 8, 10]}>
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Sphere args={[0.5]} position={[10, 8, 10]}>
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </>
  );
}

// Main App Component
export default function Stadium3DStore() {
  const [currentArea, setCurrentArea] = useState("stadium");
  const [isAnimating, setIsAnimating] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item, index) => index !== productId));
  };

  const handleTeleport = (targetArea) => {
    if (targetArea !== currentArea && !isAnimating) {
      setIsAnimating(true);
      setCurrentArea(targetArea);
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
  const currentProducts = products[currentArea] || [];

  return (
    <div className="w-full h-screen bg-black relative">
      {/* 3D Canvas */}
      <Canvas camera={{ position: cameraPositions.stadium.position, fov: 60 }}>
        <Scene3D
          currentArea={currentArea}
          onAddToCart={addToCart}
          onTeleport={handleTeleport}
        />

        <CameraController
          targetPosition={cameraPositions[currentArea]?.position}
          targetLookAt={cameraPositions[currentArea]?.target}
          isAnimating={isAnimating}
          onAnimationComplete={handleAnimationComplete}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Cart Button */}
        <button
          onClick={() => setShowCart(!showCart)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors flex items-center gap-2"
        >
          <ShoppingCart size={20} />
          <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs min-w-6 text-center">
            {cart.length}
          </span>
        </button>

        {/* Current Area Indicator */}
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <MapPin size={16} />
          <span className="capitalize font-medium">
            {currentArea === "stadium"
              ? "Main Stadium"
              : currentArea === "locker"
              ? "Locker Room"
              : currentArea === "golf"
              ? "Golf Simulator"
              : currentArea}
          </span>
        </div>

        {/* Available Products in Current Area */}
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Package size={16} />
          <span className="text-sm">{currentProducts.length} items here</span>
        </div>
      </div>

      {/* Area Navigation */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        {Object.keys(cameraPositions).map((area) => (
          <button
            key={area}
            onClick={() => handleTeleport(area)}
            disabled={isAnimating}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentArea === area
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            } ${isAnimating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {area.charAt(0).toUpperCase() + area.slice(1)}
          </button>
        ))}
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="absolute top-0 right-0 w-80 h-full bg-gray-900 text-white p-4 z-20 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart size={20} />
              Shopping Cart
            </h2>
            <button
              onClick={() => setShowCart(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 p-3 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-green-400">${item.price}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold text-green-400">
                    ${totalPrice}
                  </span>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors">
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Navigation size={16} />
          Controls
        </h3>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>🖱️ Left click + drag to rotate view</li>
          <li>🔍 Scroll to zoom in/out</li>
          <li>✨ Click glowing teleport spots to move</li>
          <li>📦 Click floating products to add to cart</li>
          <li>🎯 Use bottom-right buttons for quick navigation</li>
        </ul>
      </div>
    </div>
  );
}
