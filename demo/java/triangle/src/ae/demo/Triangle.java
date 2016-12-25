package ae.demo;

import static org.lwjgl.glfw.GLFW.*;

import ae.core.AbstractEngine;
import ae.core.SceneGraph;
import ae.math.Vector4D;
import ae.mesh.Meshes;
import ae.scenegraph.entities.Camera;
import ae.scenegraph.entities.Model;

public final class Triangle {
	
	public static void main(final String[] args) {
		
		// The engine and a scenegraph are the basic components
		final AbstractEngine engine     =
			new AbstractEngine(
				"Triangle (AE " + AbstractEngine.VERSION_STRING + ")",
				null, null, false);
		final SceneGraph     sceneGraph = new SceneGraph(engine);

		// The camera is adaptive and doesn't need to be updated
		final Camera camera = new Camera(
			sceneGraph,
			"camera",
			new Camera.AdaptiveFOV().setMinHorFOV(Camera.RATIO_SQUARE, 60));
		
		// A triangle can be created by creating a disc with 3 edges
		final Model triangle = new Model(sceneGraph).
			setMesh(Meshes.createDisc(3).createMesh()).
			setMaterial(engine.standardMaterials.get(
				false, false, false, false, false)).
			setUpdateCallback((event) -> {
				event.host.transformation.getValue().
					toIdentity().
					translate(0, 0, -2).
					rotateZ(event.getTimeF() / 200f).
					rotateX(90);
			});
		
		// Add the camera and the triangle to the scenegraph as child of the
		// root entity
		sceneGraph.root.addChild(camera);
		sceneGraph.root.addChild(triangle);
		
		// Make the background black
		engine.background.setData(Vector4D.BLACK.xyz);

		// Apply the camera to the whole screen
		engine.display.setCamera(camera);

		// React to keyboard input
		engine.input.onKeyDown.addListener((event) -> {
			switch(event.getKey()) {
				case GLFW_KEY_ESCAPE: engine.stop();              break;
				case GLFW_KEY_T:      engine.fullscreen.toggle(); break;
				case GLFW_KEY_0:      engine.setSpeed(0);         break;
				case GLFW_KEY_1:      engine.setSpeed(0.5);       break;
				case GLFW_KEY_2:      engine.setSpeed(1);         break;
				case GLFW_KEY_3:      engine.setSpeed(2);         break;
			}
		});
		
		// Begin rendering
		engine.start();
	}
}
