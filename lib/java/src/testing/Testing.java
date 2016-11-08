package testing;

import static org.lwjgl.glfw.GLFW.*;

import ae.collections.ObjectPool;
import ae.collections.PooledLinkedList;
import ae.core.AbstractEngine;
import ae.core.InputListener;
import ae.core.SceneGraph;
import ae.core.Texture;
import ae.entity.DirectionalLight;
import ae.entity.Model;
import ae.entity.PointLight;
import ae.math.Vector4D;
import ae.mesh.Meshes;
import ae.other.OrganizedObject;

public final class Testing {
	
	private static final class PooledInteger
			extends OrganizedObject<PooledInteger> {
		
		@SuppressWarnings("unused")
		public int value;
		
		public PooledInteger(
				final int value) {
			
			this.value = value;
		}
	}
	
	private static final void log(
			final String text) {
		
		System.out.println(" > " + text);
	}
	
	private static final void logAction(
			final String description) {
		
		log("[ACTION] " + description);
	}
	
	private static final void logConstructor() {
    	
		logAction("[CONSTRUCTOR]");
    }

	private static final void logTest(
			final String description) {
		
		log("[TEST]   " + description);
	}
	
	private static final boolean testObjectPool() {
		
		System.out.println("Testing ObjectPool<PooledInteger>...");
		
		try {

			logConstructor();
    		
    		final ObjectPool<PooledInteger> list =
    			new ObjectPool<>(() -> new PooledInteger(0));
    		final PooledInteger[] integers = new PooledInteger[10];

    		logAction("allocate 10 objects");
    		
    		for(int i = 0; i < 10; i++) {
    			integers[i]       = list.provideObject();
    			integers[i].value = i;
    		}
    		
    		logTest("size == 10");
    		if(list.getSize() != 10) return false;

    		logTest("capacity == 10");
    		if(list.getCapacity() != 10) return false;
    		
    		logAction("free last object");
    		list.free(integers[integers.length - 1]);

    		logTest("size == 9");
    		if(list.getSize() != 9) return false;

    		logTest("capacity == 10");
    		if(list.getCapacity() != 10) return false;
    		
		} catch(Exception e) {
			e.printStackTrace();
			return false;
		}
		
		return true;
	}
	
	private static final boolean testPooledLinkedList() {
		
		System.out.println("Testing PooledLinkedList<Integer>...");
		
		try {
	
			logConstructor();
			
			final PooledLinkedList<Integer> list = new PooledLinkedList<>();
			
			logAction("insert 10 elements at end");
			
			for(int i = 0; i < 10; i++) list.insertAtEnd(i);
			
			logTest("list.getFirst() == 0");
			if(list.getFirst() != 0) return false;
			
			logTest("list.getLast() == 9");
			if(list.getLast() != 9) return false;
			
			logAction("iterate all elements");
			
			int counter = 0;
			logTest("list[i] == i");
			for(int i : list) {
				if(i != counter) return false;
	    		counter++;
			}
			
		} catch(Exception e) {
			e.printStackTrace();
			return false;
		}
		
		return true;
	}
	
	public static final void main(
			final String[] args) {
		
		int testCount    = 0;
		int successCount = 0;
		
		if(testObjectPool()) successCount++;
		testCount++;
		
		if(testPooledLinkedList()) successCount++;
		testCount++;
		
		System.out.println();
		System.out.println(
			"Testing complete: " + successCount + " of " + testCount +
			" tests successful!");
		
		final AbstractEngine     engine         = new AbstractEngine("Engine Test");
		final SceneGraph sceneGraph     = new SceneGraph();
		final Texture    checkerTexture =
			Texture.createCheckerTexture(Vector4D.WHITE, Vector4D.GREY);
		
		final Model quad = new Model(sceneGraph).
			setMesh(Meshes.createQuad(8, true).createMesh()).
			setTexture(checkerTexture).
			setUpdater((model, time, delta) -> {
				model.transformation.getValue().
					toIdentity().
					translate(0, 0, -12).
					rotateX(45).
					rotateY((float)time / 200f);
			});
		
		final Model cube = new Model(sceneGraph).
			setMesh(Meshes.createCube(2, true).createMesh()).
			setTexture(checkerTexture).
			setUpdater((model, time, delta) -> {
				model.transformation.getValue().
					toIdentity().
					translate(-2, 2, -2).
					rotateX((float)time / 200f);
			});
		
		final Model torus = new Model(sceneGraph).
			setMesh(
				Meshes.createTorus(64, 32, 1, 0.5f, 0.5f, false).createMesh()).
			setTexture(checkerTexture).
			setUpdater((model, time, delta) -> {
				model.transformation.getValue().
					toIdentity().
					translate(2, 2, 2).
					rotateY((float)time / 70f).
					rotateZ((float)time / 100f).
					rotateX((float)time / 200f);
			});
		
		final DirectionalLight ambLight = new DirectionalLight(sceneGraph).
			makeAmbient();
		
		final PointLight pointLightRed = new PointLight(sceneGraph).
			setUpdater((light, time, delta) -> {
				light.transformation.getValue().
					toIdentity().
					rotateY((float)time / 50f).
					translate(2, 1, 0);
			}).
			setRange(4).makeLinear();
		
		final PointLight pointLightGreen = new PointLight(sceneGraph).
			setUpdater((light, time, delta) -> {
				light.transformation.getValue().
					toIdentity().
					rotateY((float)time / 50f + 120).
					translate(2, 1, 0);
			}).
			setRange(4).makeLinear();

		final PointLight pointLightBlue = new PointLight(sceneGraph).
			setUpdater((light, time, delta) -> {
				light.transformation.getValue().
					toIdentity().
					rotateY((float)time / 50f + 240).
					translate(2, 1, 0);
			}).
			setRange(4).makeLinear();
		
		cube.color.getValue().setData(1, 1, 0, 1);
		
		ambLight.color.getValue().setData(0.1f, 0.1f, 0.1f);
		ambLight.direction.getValue().setData(0, 1, 0);
		
		pointLightRed.color.getValue().setData(1, 0.3f, 0.3f);
		pointLightGreen.color.getValue().setData(0.3f, 1, 0.3f);
		pointLightBlue.color.getValue().setData(0.3f, 0.3f, 1);
		
		sceneGraph.root.addChild(quad);
		
		quad.addChild(cube);
		quad.addChild(torus);
		quad.addChild(ambLight);
		quad.addChild(pointLightRed);
		quad.addChild(pointLightGreen);
		quad.addChild(pointLightBlue);
		
		engine.background.setData(0.5f, 0, 0);
		engine.setSceneGraph(sceneGraph);
	
		engine.setInputListener(new InputListener() {
			
			@Override
			public final void onKeyDown(
					final int key) {
				
				switch(key) {
					case GLFW_KEY_ESCAPE: engine.stop(); break;
					case GLFW_KEY_T: engine.toggleFullscreen(); break;
					case GLFW_KEY_0: engine.setSpeed(0); break;
					case GLFW_KEY_1: engine.setSpeed(0.5); break;
					case GLFW_KEY_2: engine.setSpeed(1); break;
					case GLFW_KEY_3: engine.setSpeed(2); break;
				}
			}
		});
		
		engine.setResizeCallback((eng) -> {
			engine.projection.toIdentity().projectPerspectiveHorFOV(
				engine.getFramebufferWidth(), engine.getFramebufferHeight(),
				60, 2);
		});
		
		engine.start();
	}
}
