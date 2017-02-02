
// Unit vectors defined as 3D vectors
ae.math.X_POS = ae.math.Vector3D.createConstB( 1,  0,  0);
ae.math.X_NEG = ae.math.Vector3D.createConstB(-1,  0,  0);
ae.math.Y_POS = ae.math.Vector3D.createConstB( 0,  1,  0);
ae.math.Y_NEG = ae.math.Vector3D.createConstB( 0, -1,  0);
ae.math.Z_POS = ae.math.Vector3D.createConstB( 0,  0,  1);
ae.math.Z_NEG = ae.math.Vector3D.createConstB( 0,  0, -1);

// Colors defined as 4D vectors
ae.math.BLACK  = ae.math.Vector4D.createConstB(0,       1);
ae.math.GREY   = ae.math.Vector4D.createConstB(0.5,     1);
ae.math.WHITE  = ae.math.Vector4D.createConstB(1,       1);
ae.math.RED    = ae.math.Vector4D.createConstC(1, 0, 0, 1);
ae.math.GREEN  = ae.math.Vector4D.createConstC(0, 1, 0, 1);
ae.math.BLUE   = ae.math.Vector4D.createConstC(0, 0, 1, 1);
ae.math.YELLOW = ae.math.Vector4D.createConstC(1, 1, 0, 1);
ae.math.PURPLE = ae.math.Vector4D.createConstC(1, 0, 1, 1);
ae.math.CYAN   = ae.math.Vector4D.createConstC(0, 1, 1, 1);

// Function used for fast normal computation in the meshes
ae.mesh._ACOS = new ae.util.SampledFunction(10000, -1, 1, (x) => Math.acos(x));

// Freeze all namespaces
Object.freeze(ae.core._p);
Object.freeze(ae.math._p);
Object.freeze(ae.mesh._p);
Object.freeze(ae.util._p);
Object.freeze(ae.core);
Object.freeze(ae.math);
Object.freeze(ae.mesh);
Object.freeze(ae.util);
Object.freeze(ae);
