package ae.demo;

import static org.lwjgl.glfw.GLFW.*;

import ae.core.AbstractEngine;
import ae.core.SceneGraph;
import ae.material.GlslType;
import ae.material.Material;
import ae.material.MaterialBuilder;
import ae.math.Vector4D;
import ae.mesh.Meshes;
import ae.scenegraph.entities.Camera;
import ae.scenegraph.entities.DirectionalLight;
import ae.scenegraph.entities.Model;

public final class HoverPicking {
	
	public static void main(final String[] args) {
		
		// The engine and a scenegraph are the basic components
		final AbstractEngine engine     =
			new AbstractEngine(
				"Hover Picking (AE " + AbstractEngine.VERSION_STRING + ")",
				null, null, true);
		final SceneGraph     sceneGraph = new SceneGraph(engine);
		
		// The camera is adaptive and doesn't need to be updated
		final Camera camera = new Camera(
			sceneGraph,
			"camera",
			new Camera.AdaptiveFOV().setMinHorFOV(Camera.RATIO_SQUARE, 60));
		
		final MaterialBuilder mb       = new MaterialBuilder();
		final Material        material = mb.
			addParameter("color", GlslType.FLOAT3).
			addParameter("rim", GlslType.FLOAT3).
			//setColor(mb.mult(mb.param("color"), mb.phong(mb.normal()))).
			setColor(mb.add(
				mb.mult(mb.sub(mb.constF(1, 1, 1), mb.abs(mb.dot(mb.normal(), mb.normalize(mb.position())))), mb.param("rim")),
				mb.mult(mb.param("color"), mb.phong(mb.normal())))).
			createMaterial(engine, "Rim");
		
		// Use a standard cube for the crate and apply some fancy rotation
		// Apply a standard material with diffuse light computation
		final Model crate = new Model(sceneGraph).
			setMesh(Meshes.createTorus(128, 64, 1, 0.5f, 0.5f, false).createMesh()).
			setMaterial(material).
			setUpdateCallback((event) -> {
				
				material.setParam("color", 0, 0, 0.5f);
				
				if(engine.input.getModel() == event.host) {
					material.setParam("rim", 1f, 0.6f, 0);
				} else {
					material.setParam("rim", 0, 0, 0);
				}
				
				event.host.transformation.getValue().
					toIdentity().
					translate(0, 0, -4).
					rotateZ(event.getTimeF() / 200f).
					rotateY(event.getTimeF() / 140f).
					rotateX(event.getTimeF() / 90f);
			});
		
		// We place an ambient light source to also light the back sides of the
		// cube
		final DirectionalLight light =
			new DirectionalLight(sceneGraph).makeSpot();
		
		// Set light parameters
		light.color    .getValue().setData(Vector4D.WHITE.xyz);
		light.direction.getValue().setData(0, 1, 1);
		
		// Add the camera, the crate and the light source to the scenegraph
		// All entities will be children of the root entity
		sceneGraph.root.addChild(camera);
		sceneGraph.root.addChild(crate);
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
