package ae.demo;

import static org.lwjgl.glfw.GLFW.*;

import ae.core.AbstractEngine;
import ae.core.SceneGraph;
import ae.math.Vector3D;
import ae.math.Vector4D;
import ae.mesh.FileFormat;
import ae.scenegraph.Entity;
import ae.scenegraph.entities.Camera;
import ae.scenegraph.entities.DirectionalLight;

public final class MeshImport {
	
public static void main(final String[] args) {
		
		// The engine and a scenegraph are the basic components
		final AbstractEngine engine     =
			new AbstractEngine(
				"Mesh Import (AE " + AbstractEngine.VERSION_STRING + ")",
				null, null, false, 10);
		final SceneGraph     sceneGraph = new SceneGraph(engine);
		
		// The camera is adaptive and doesn't need to be updated
		final Camera camera = new Camera(
			sceneGraph,
			"camera",
			new Camera.AdaptiveFOV().setMinHorFOV(Camera.RATIO_SQUARE, 60));
		
		// Load a wavefront object model (.obj)
		final Entity<?> importMesh =
			FileFormat.load("human.obj").toNestedEntity(
    			sceneGraph,
    			"human",
    			(model) -> model.setMaterial(engine.standardMaterials.get(
    				false, false, true, false, false))).
			setUpdateCallback((event) -> event.host.transformation.getValue().
				toIdentity().
				rotateY(event.getTimeF() / 100f).
				translate(0, -10, 0));

		// The imported mesh is encapsulated in another entity to apply a
		// separate rotation to the model
		final Entity<?> meshRotation = Entity.group(null, true, importMesh);
		
		// We place an ambient light source to also light the back sides of the
		// mesh
		final DirectionalLight light =
			new DirectionalLight(sceneGraph).makeAmbient();
		
		// Set light parameters
		light.color    .getValue().setData(Vector3D.createConst(0.7f));
		light.direction.getValue().setData(1, 1, 1);
		
		// Move the camera away from the model
		camera.transformation.getValue().translate(0, 0, 23);
		
		// Add the camera, the crate and the light source to the scenegraph
		// All entities will be children of the root entity
		sceneGraph.root.addChild(camera);
		sceneGraph.root.addChild(meshRotation);
		sceneGraph.root.addChild(light);
		
		// Make the background black
		engine.background.setData(Vector4D.BLACK.xyz);
		
		// Apply the camera to the whole screen
		engine.display.setCamera(camera);
		
		// React to keyboard input
		engine.input.onKeyDown.addListener((event) -> {
			switch(event.getKey()) {
				case GLFW_KEY_ESCAPE: engine.stop();              break;
				case GLFW_KEY_T:      engine.fullscreen.toggle(); break;
			}
		});
		
		// React to vertical mouse movement
		engine.input.onMouseMove.addListener((event) -> {
			final float relY =
				(float)event.host.getY() / engine.getFramebufferHeight() - 0.5f;
			meshRotation.transformation.getValue().
				toIdentity().rotateX(-90 * relY);
		});
		
		// Begin rendering
		engine.start();
	}
}
