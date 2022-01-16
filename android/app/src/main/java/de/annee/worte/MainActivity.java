package de.annee.worte;

import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.BridgeActivity;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends BridgeActivity {


  @Override
  public void onStart() {
    super.onStart();

    Log.i("de.annee.worte", "Start subscribing to topics/all");

    FirebaseMessaging.getInstance().subscribeToTopic("all")
      .addOnCompleteListener(new OnCompleteListener<Void>() {
        @Override
        public void onComplete(@NonNull Task<Void> task) {

          Log.i("de.annee.worte", "Subscribed to topics/all");

        }
      });
  }
}
